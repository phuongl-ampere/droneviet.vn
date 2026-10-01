# Customer Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a secure `/tai-khoan` customer workspace with cookie-backed sessions, editable profile information, and private order history.

**Architecture:** NestJS remains the identity and order-ownership authority. Login and registration set an `HttpOnly` access cookie while preserving the existing JSON token response for the admin interface. A forward-only database migration introduces profile phone data and customer-owned orders; the Next.js client consumes typed credentialed APIs through a session provider and renders the account workspace.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, NestJS, TypeORM, MySQL, JWT.

## Global Constraints

- Keep existing admin bearer-token behavior and guest checkout/order tracking behavior intact.
- Do not store customer JWTs or passwords in browser storage or URLs.
- Use `HttpOnly`, `SameSite=Lax`, host-only cookies; only set `Secure` in production.
- All new user-facing strings use the established i18n catalog.
- Keep `/tai-khoan` responsive, keyboard-accessible, and visually aligned with the existing DroneViet operational UI.
- Write the failing test before each implementation change.

---

### Task 1: Add Customer Ownership and Profile Schema

**Files:**
- Create: `backend/src/database/migrations/1766920200000-customer-account.ts`
- Modify: `backend/src/database/data-source.ts`
- Modify: `backend/src/auth/entities/user.entity.ts`
- Modify: `backend/src/orders/entities/order.entity.ts`
- Test: `backend/src/database/migrations/1766920200000-customer-account.spec.ts`

**Interfaces:**
- Produces nullable `User.phone: string | null`.
- Produces nullable `Order.customerId: string | null` and `Order.customer: User | null`.
- Produces an indexed `orders.customerId` foreign key with `ON DELETE SET NULL`.

- [ ] **Step 1: Write the failing migration test**

```ts
it("adds profile phone and links only orders whose contact email matches a user", async () => {
  // Seed users and orders with a matching, non-matching, and null contact email.
  // Run migration.up(queryRunner).
  // Assert matching order has customerId, all other orders keep null.
});
```

- [ ] **Step 2: Run the migration test to verify it fails**

Run: `cd backend && npm test -- src/database/migrations/1766920200000-customer-account.spec.ts`

Expected: FAIL because the migration class does not exist.

- [ ] **Step 3: Add the minimal migration and entities**

```ts
await queryRunner.addColumn("users", new TableColumn({
  name: "phone",
  type: "varchar",
  isNullable: true,
}));

await queryRunner.addColumn("orders", new TableColumn({
  name: "customerId",
  type: "char",
  length: "36",
  isNullable: true,
}));
await queryRunner.createIndex("orders", new TableIndex({
  name: "IDX_orders_customer_id",
  columnNames: ["customerId"],
}));
await queryRunner.createForeignKey("orders", new TableForeignKey({
  columnNames: ["customerId"],
  referencedTableName: "users",
  referencedColumnNames: ["id"],
  onDelete: "SET NULL",
}));
```

Backfill only with a normalized exact comparison between `orders.contactEmail` and `users.email`; add the migration to `data-source.ts`. Map the new columns and relation in the entities.

- [ ] **Step 4: Run the migration test to verify it passes**

Run: `cd backend && npm test -- src/database/migrations/1766920200000-customer-account.spec.ts`

Expected: PASS with matching email linked and all unmatched orders unchanged.

- [ ] **Step 5: Commit**

```bash
git add backend/src/database/migrations/1766920200000-customer-account.ts \
  backend/src/database/migrations/1766920200000-customer-account.spec.ts \
  backend/src/database/data-source.ts \
  backend/src/auth/entities/user.entity.ts \
  backend/src/orders/entities/order.entity.ts
git commit -m "feat: link customer accounts to orders"
```

### Task 2: Implement Cookie Authentication and Profile Endpoints

**Files:**
- Create: `backend/src/auth/dto/update-profile.dto.ts`
- Modify: `backend/src/auth/auth.controller.ts`
- Modify: `backend/src/auth/auth.service.ts`
- Modify: `backend/src/auth/jwt-auth.guard.ts`
- Test: `backend/src/auth/auth.controller.spec.ts`
- Test: `backend/src/auth/auth.service.spec.ts`

**Interfaces:**
- Produces `GET /auth/profile`, `PATCH /auth/profile`, and `POST /auth/logout`.
- Extends `JwtAuthGuard` to read bearer tokens first, then the `droneviet_access` cookie.
- Produces `AuthService.profile(userId)` and `AuthService.updateProfile(userId, input)`.

- [ ] **Step 1: Write failing controller/service tests**

```ts
it("sets an HttpOnly session cookie and retains the access token response on login", async () => {
  await controller.login({ email: "customer@example.vn", password: "Password123!" }, response);
  expect(response.cookie).toHaveBeenCalledWith(
    "droneviet_access",
    expect.any(String),
    expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
  );
});

it("returns and updates only the authenticated user's safe profile", async () => {
  await expect(service.updateProfile("user-a", {
    displayName: "Nguyen Van A",
    phone: "0901234567",
  })).resolves.toMatchObject({ id: "user-a", phone: "0901234567" });
});
```

- [ ] **Step 2: Run focused auth tests to verify they fail**

Run: `cd backend && npm test -- src/auth/auth.controller.spec.ts src/auth/auth.service.spec.ts`

Expected: FAIL because no cookie/profile/logout contract exists.

- [ ] **Step 3: Implement session cookie, safe profile, and cookie guard extraction**

Use `@Res({ passthrough: true })` to set the cookie while returning the existing session object. Add a small cookie-header parser inside `JwtAuthGuard`; do not add a cookie-parser dependency. `UpdateProfileDto` permits only trimmed `displayName` (2-120 chars) and optional trimmed phone. `logout` calls `response.clearCookie("droneviet_access", { path: "/" })`.

- [ ] **Step 4: Run focused auth tests to verify they pass**

Run: `cd backend && npm test -- src/auth/auth.controller.spec.ts src/auth/auth.service.spec.ts`

Expected: PASS; bearer-token behavior remains covered by existing guard tests.

- [ ] **Step 5: Commit**

```bash
git add backend/src/auth
git commit -m "feat: add customer cookie sessions and profiles"
```

### Task 3: Attach Authenticated Checkouts and Expose Own Orders

**Files:**
- Modify: `backend/src/orders/orders.controller.ts`
- Modify: `backend/src/orders/orders.service.ts`
- Modify: `backend/src/orders/orders.module.ts`
- Modify: `backend/src/auth/jwt-auth.guard.ts`
- Test: `backend/src/orders/orders.controller.spec.ts`
- Test: `backend/src/orders/orders.service.spec.ts`
- Test: `src/lib/commerce/checkout.test.ts`
- Modify: `src/lib/commerce/checkout.ts`

**Interfaces:**
- `POST /orders` remains public and accepts an optional valid customer identity.
- `GET /orders/me` requires a valid identity and returns only that customer's orders with line summaries.
- `OrdersService.createOrder(input, customerId?: string)` persists `customerId` when supplied.

- [ ] **Step 1: Write failing ownership tests**

```ts
it("assigns a valid optional customer identity to a created order", async () => {
  await service.createOrder(createOrderInput, "customer-a");
  expect(savedOrder.customerId).toBe("customer-a");
});

it("lists only the authenticated customer's orders", async () => {
  await expect(service.listForCustomer("customer-a")).resolves.toEqual([
    expect.objectContaining({ customerId: "customer-a" }),
  ]);
});
```

Add a checkout helper test asserting the `POST /orders` fetch uses `credentials: "include"`.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `cd backend && npm test -- src/orders/orders.controller.spec.ts src/orders/orders.service.spec.ts`

Run: `npm test -- src/lib/commerce/checkout.test.ts`

Expected: FAIL because the owner cannot be attached or queried and checkout does not include credentials.

- [ ] **Step 3: Add optional identity support and private order listing**

Implement a narrowly scoped optional guard that only attaches a verified identity when a bearer token or cookie is present; guest requests remain guest requests. Pass `request.user?.sub` to `createOrder`. Add guarded `GET /orders/me` and `OrdersService.listForCustomer`, selecting order lines and ordering by `createdAt DESC`. Set `credentials: "include"` in `submitCheckout`.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `cd backend && npm test -- src/orders/orders.controller.spec.ts src/orders/orders.service.spec.ts`

Run: `npm test -- src/lib/commerce/checkout.test.ts`

Expected: PASS; guest checkout remains unowned and private lists never query by email.

- [ ] **Step 5: Commit**

```bash
git add backend/src/orders backend/src/auth/jwt-auth.guard.ts src/lib/commerce/checkout.ts src/lib/commerce/checkout.test.ts
git commit -m "feat: expose customer-owned order history"
```

### Task 4: Add Customer Session Client and Login Redirects

**Files:**
- Create: `src/components/customer/customer-session-provider.tsx`
- Create: `src/lib/commerce/customer-api.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/customer/customer-gate.tsx`
- Modify: `src/components/localized-chrome.tsx`
- Modify: `src/lib/i18n.ts`
- Test: `src/components/customer/customer-session-provider.test.tsx`
- Test: `src/components/customer/customer-gate.test.tsx`

**Interfaces:**
- `useCustomerSession()` exposes `{ user, loading, refresh, setUser, logout }`.
- `customerApi.profile()`, `customerApi.updateProfile(input)`, `customerApi.listOwnOrders()`, and `customerApi.logout()` are credentialed.
- Login/register navigate to a validated internal `next` path or `/tai-khoan`.

- [ ] **Step 1: Write failing session and redirect tests**

```tsx
it("loads a safe cookie-backed profile without reading browser storage", async () => {
  render(<CustomerSessionProvider><Probe /></CustomerSessionProvider>);
  expect(await screen.findByText("customer@example.vn")).toBeInTheDocument();
});

it("redirects a signed-in customer to the validated next account path", async () => {
  // Mock loginCustomer and router; render CustomerGate with ?next=/tai-khoan.
  // Submit valid credentials and expect router.replace("/tai-khoan").
});
```

- [ ] **Step 2: Run focused frontend tests to verify they fail**

Run: `npm test -- src/components/customer/customer-session-provider.test.tsx src/components/customer/customer-gate.test.tsx`

Expected: FAIL because the provider, API client, and redirect behavior do not exist.

- [ ] **Step 3: Implement the credentialed client and provider**

All customer API requests set `credentials: "include"` and map `401` to a signed-out session. Mount `CustomerSessionProvider` inside the root layout, outside route-specific chrome. Extend commerce-route detection for `/tai-khoan`; add concise Vietnamese and English account/session translation keys. In `CustomerGate`, replace the transient success panel with provider `setUser` and `router.replace(safeNextPath)`.

- [ ] **Step 4: Run focused frontend tests to verify they pass**

Run: `npm test -- src/components/customer/customer-session-provider.test.tsx src/components/customer/customer-gate.test.tsx`

Expected: PASS; no test reads or writes `localStorage`/`sessionStorage`.

- [ ] **Step 5: Commit**

```bash
git add src/components/customer src/lib/commerce/customer-api.ts src/app/layout.tsx \
  src/components/localized-chrome.tsx src/lib/i18n.ts
git commit -m "feat: persist customer sessions with cookies"
```

### Task 5: Build the `/tai-khoan` Workspace

**Files:**
- Create: `src/app/tai-khoan/page.tsx`
- Create: `src/components/customer/customer-account.tsx`
- Create: `src/components/customer/customer-account.test.tsx`
- Modify: `src/components/site-header.tsx`
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- `CustomerAccount` consumes `useCustomerSession()` and `customerApi`.
- Profile edit accepts `{ displayName?: string; phone?: string }`.
- Order rows consume `{ id, orderNumber, status, paymentMethod, totalVnd, createdAt, lines }`.

- [ ] **Step 1: Write failing account UI tests**

```tsx
it("renders profile details and saves the edit drawer", async () => {
  // Mock an authenticated provider and customerApi update.
  // Edit phone, save, and expect refreshed profile text.
});

it("renders only returned orders and a store link for an empty history", async () => {
  // Mock listOwnOrders with one order, then an empty array.
});

it("redirects signed-out visitors to login with the account next path", async () => {
  // Mock an unauthenticated provider and expect router.replace.
});
```

- [ ] **Step 2: Run the account UI test to verify it fails**

Run: `npm test -- src/components/customer/customer-account.test.tsx`

Expected: FAIL because `/tai-khoan` and `CustomerAccount` do not exist.

- [ ] **Step 3: Implement the account page**

Render a restrained identity banner with initials, display name, email, and icon-only logout control with tooltip. Add profile cards for verified email and personal contact information. Open a focused edit drawer for name/phone with saving, success, and error states. Render responsive order rows with status, amount, date, payment method, and expandable lines. Use existing VND formatting and translated labels. Preserve stable layout during initial loading and show an unframed empty state linked to `/cua-hang`.

- [ ] **Step 4: Add the account entry point and run UI tests**

Add the `/tai-khoan` link to the customer header area and route it through commerce chrome. Run:

```bash
npm test -- src/components/customer/customer-account.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/tai-khoan src/components/customer/customer-account.tsx \
  src/components/customer/customer-account.test.tsx src/components/site-header.tsx src/lib/i18n.ts
git commit -m "feat: add customer account workspace"
```

### Task 6: Verify End-to-End Behavior

**Files:**
- Modify only if verification exposes a defect in a preceding task.

- [ ] **Step 1: Run relevant backend and frontend test suites**

```bash
cd backend && npm test
cd ..
npm test
```

Expected: all tests relevant to customer account pass. Record pre-existing unrelated failures separately.

- [ ] **Step 2: Run the local database migration**

```bash
cd backend
DATABASE_HOST=127.0.0.1 DATABASE_PORT=3307 DATABASE_NAME=droneviet DATABASE_USER=droneviet DATABASE_PASSWORD=droneviet npm run migration:run
```

Expected: migration applies once and adds the customer profile/order columns.

- [ ] **Step 3: Browser verification**

Use Chromium against `http://localhost:3003`:

1. Register or log in as a customer.
2. Refresh `/tai-khoan` and verify the profile remains authenticated.
3. Update name and phone; refresh and verify persisted values.
4. Place an authenticated checkout; verify the new order appears only in that account.
5. Log out; verify `/tai-khoan` redirects to `/dang-nhap?next=/tai-khoan`.
6. Inspect browser storage and URL to confirm no password or access token appears.

- [ ] **Step 4: Commit verification fixes only when needed**

```bash
git add <verified-fix-files>
git commit -m "fix: complete customer account verification"
```
