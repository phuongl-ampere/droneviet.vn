# Customer Account Design

## Goal

Add a secure, customer-owned `/tai-khoan` workspace where signed-in customers can review and edit their profile and view only their own orders.

## Context

The current customer login and registration screens receive a JWT in JavaScript memory and show a one-time success state. The backend has no profile endpoints, and orders have contact data but no relation to a user. WeMake's `/account` page provides the functional reference: an identity banner, concise profile cards, in-context profile editing, and an account workspace rather than a marketing page.

## Scope

The feature includes:

- Persistent customer authentication using an `HttpOnly` access-token cookie.
- A protected `/tai-khoan` route with profile and order-history sections.
- Safe read/update APIs for the current user.
- Order ownership for authenticated checkout and a one-time migration that links eligible existing orders.
- Login, registration, logout, loading, empty, unauthorized, and failure states.

The feature excludes:

- Password changes and password-reset flows.
- Address book, saved payment methods, subscriptions, coupons, or loyalty features.
- Customer order cancellation, returns, and payment actions.
- Altering the existing admin access-token flow.

## Architecture

### Authentication and Session

The backend remains the authority for authentication. On successful `POST /auth/login` or `POST /auth/register`, it will:

1. Preserve the existing JSON `accessToken` response for the admin UI and backward compatibility.
2. Set a `droneviet_access` cookie with `HttpOnly`, `SameSite=Lax`, `Path=/`, and an environment-sensitive `Secure` flag.
3. Return safe user fields only: `id`, `email`, `displayName`, `phone`, and `roles`.

The existing JWT guard will accept a bearer token first and then the `droneviet_access` cookie. A `POST /auth/logout` endpoint clears the cookie.

Frontend customer API calls use `credentials: "include"` and never persist the token or password in `localStorage`, `sessionStorage`, URLs, or component state beyond the active form submission.

### Profile API

All profile endpoints require authentication:

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/auth/profile` | Returns the authenticated user's safe profile. |
| `PATCH` | `/auth/profile` | Updates `displayName` and `phone`; email and roles are immutable here. |
| `POST` | `/auth/logout` | Clears the customer access cookie. |

`displayName` is trimmed and must be 2-120 characters when supplied. `phone` is optional, trimmed, and limited to the existing local contact format. Authentication failures return `401`; invalid profile edits return standard validation errors.

### Order Ownership

`orders` gains a nullable `customerId` foreign key to `users`, indexed and configured with `ON DELETE SET NULL`.

- Guest checkout remains valid and creates an order without an owner.
- Authenticated checkout reads the optional customer identity from the access cookie and saves `customerId`.
- `GET /orders/me` is protected and returns only orders where `customerId` is the authenticated user ID. It includes the line summaries required by the account page, ordered newest first.
- No route returns orders by a caller-supplied email address.

A forward-only migration adds `users.phone`, adds the order ownership relation, and links existing orders where a non-null `contactEmail` exactly matches a unique user email after normalization. Orders with no match remain guest orders. The migration does not change order totals, status, payment, or contact data.

### Frontend Structure

The account UI is client-driven because the commerce API is a separate origin in local development.

| Unit | Responsibility |
| --- | --- |
| `CustomerSessionProvider` | Loads `/auth/profile`, exposes `user`, `loading`, `logout`, and refresh behavior to customer screens. |
| `src/lib/commerce/customer-api.ts` | Centralizes credentialed profile, logout, and own-order requests with typed responses. |
| `src/app/tai-khoan/page.tsx` | Provides the route and authentication boundary. |
| `CustomerAccount` | Renders profile, edit drawer, order list, loading, empty, and failure states. |
| Existing checkout request helper | Sends credentials so an authenticated checkout can claim its order. |

The existing customer login/register forms redirect to the validated `next` destination, defaulting to `/tai-khoan`, once the server session is established.

### Experience

The visual hierarchy takes the behavior of WeMake's account page while using DroneViet's existing dark teal, white, and restrained operational styling:

1. An identity banner with initials, display name, email, and a sign-out control.
2. A two-column profile area: read-only verified email and editable personal contact details.
3. A compact profile edit drawer that saves name and phone without leaving the page.
4. An order-history section with order number, creation date, status, total, payment method, and expandable line summaries.
5. Clear empty states: customers with no orders see a direct link to the store; unsigned visitors are redirected to `/dang-nhap?next=/tai-khoan`.

The layout collapses to one column on narrow screens. Controls have stable dimensions, keyboard focus, disabled save state, and concise inline success/error feedback.

### Error Handling

- An initial `401` from `/auth/profile` is the signed-out state, not a user-facing technical error.
- A later `401` clears session state and redirects to login with the current `/tai-khoan` destination.
- Profile save and order-load failures render actionable inline messages while retaining visible profile data where possible.
- Loading states reserve their layout to prevent content shifting.
- The account route and fallback forms use `POST` so credentials are never serialized into a URL when JavaScript fails to hydrate.

## Compatibility

- Admin login keeps consuming the existing JSON `accessToken`.
- Guest checkout and guest order tracking remain available.
- Existing orders remain readable through current administrative and guest flows.
- The account UI does not expose admin-only workflow actions.

## Testing

- Backend service/controller tests cover profile authorization, validation, logout cookie behavior, order ownership, and the migration's matching/non-matching order cases.
- Frontend tests cover authenticated rendering, redirect for signed-out users, profile edit save/error behavior, order states, and the `POST` fallback form method.
- Browser verification covers customer login, profile update, authenticated checkout attaching an order, and the resulting order visible at `/tai-khoan`.

## Acceptance Criteria

1. A registered customer can log in, refresh the page, and remain signed in without a browser-stored token.
2. `/tai-khoan` shows the authenticated customer's name, email, and optional phone, and permits updating name and phone only.
3. A customer sees only their owned orders and never obtains orders by providing an email address.
4. An authenticated checkout attaches its newly created order to that customer; guest checkout remains anonymous.
5. Existing orders with a matching contact email are linked by the migration; unmatched orders are unchanged.
6. Logging out removes the session and sends the user to the login route.
7. Passwords and access tokens are absent from URLs and browser storage.
