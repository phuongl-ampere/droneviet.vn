# Authenticated Checkout Design

## Goal

Keep the checkout button visible, but require a customer session only after the customer presses it. A successful sign-in returns the customer to the checkout they requested.

## User flow

1. A visitor adds products to the browser-backed cart and sees the existing checkout button.
2. Pressing checkout checks the customer session after it has finished loading.
3. A signed-out visitor is sent to the locale-matching login page with a safe `next` query value: `/dang-nhap?next=%2Fthanh-toan` or `/en/login?next=%2Fen%2Fcheckout`.
4. The existing login and registration screen validates `next`, prevents protocol-relative redirects, and replaces the browser location with checkout after authentication.
5. A signed-in visitor proceeds to the existing checkout form without a redirect.

## Boundaries

- The cart remains unchanged while the visitor signs in.
- The client-side gate is attached to the existing checkout action, not page entry, so the button remains visible.
- `POST /orders` requires a valid customer JWT as a server-side backstop; direct unauthenticated requests receive `401` and cannot create guest orders.
- Order tracking and payment-resume routes remain unchanged because they are outside this checkout-entry requirement.

## Error handling and verification

- The action remains disabled while the customer session is resolving, preventing a redirect based on an unknown session.
- Tests cover Vietnamese and English signed-out redirects, signed-in navigation, preservation of the cart action, and the protected order endpoint.
- Local development verification exercises the actual click-to-login redirect and the post-login return URL.
