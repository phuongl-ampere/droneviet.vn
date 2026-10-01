# Authenticated Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the cart checkout button visible while redirecting signed-out shoppers to login and allowing only authenticated customers to create orders.

**Architecture:** The cart page reads the existing `CustomerSessionProvider` state only when its checkout button is pressed. It routes anonymous shoppers to the locale-specific login page with an encoded local checkout path; `CustomerGate` already validates and consumes that `next` value after login. The order controller changes its create-order route from the optional JWT guard to the required guard as a server-side backstop.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, NestJS 10.

## Global Constraints

- Keep the checkout action visible whenever the cart has at least one line.
- Do not redirect merely by visiting the cart or checkout page; redirect only after the checkout action is pressed.
- Use `/dang-nhap?next=%2Fthanh-toan` for Vietnamese and `/en/login?next=%2Fen%2Fcheckout` for English.
- Preserve browser-backed cart lines through the login round trip.
- Require `JwtAuthGuard` for `POST /orders`; leave order tracking and payment-resume behavior unchanged.

---

### Task 1: Cover the cart checkout action

**Files:**
- Create: `src/app/gio-hang/page.test.tsx`
- Modify: `src/app/gio-hang/page.tsx:1-90`

**Interfaces:**
- Consumes: `useCustomerSession(): { loading: boolean; user: CustomerProfile | null }` and `useRouter().push(href)`.
- Produces: a checkout button that calls `router.push(checkoutHref)` for a signed-in user and `router.push(loginHref + "?next=" + encodeURIComponent(checkoutHref))` for an anonymous user.

- [ ] **Step 1: Write the failing cart-page tests**

```tsx
it("sends a signed-out Vietnamese shopper to login when checkout is pressed", () => {
  useCustomerSession.mockReturnValue({ loading: false, user: null });

  renderCart("vi");
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }));

  expect(push).toHaveBeenCalledWith("/dang-nhap?next=%2Fthanh-toan");
});

it("opens English checkout for a signed-in shopper", () => {
  useCustomerSession.mockReturnValue({ loading: false, user: customer });

  renderCart("en");
  fireEvent.click(screen.getByRole("button", { name: "Checkout" }));

  expect(push).toHaveBeenCalledWith("/en/checkout");
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `npm test -- src/app/gio-hang/page.test.tsx`

Expected: FAIL because the current checkout control is a direct `Link` and does not call `router.push`.

- [ ] **Step 3: Write the minimal cart action**

```tsx
const router = useRouter();
const { loading, user } = useCustomerSession();
const loginHref = locale === "vi" ? "/dang-nhap" : "/en/login";

function handleCheckout() {
  if (loading) return;

  router.push(
    user
      ? checkoutHref
      : `${loginHref}?next=${encodeURIComponent(checkoutHref)}`,
  );
}
```

Replace only the non-empty-cart checkout `Link` with a `type="button"` control using the existing visual classes, `onClick={handleCheckout}`, and `disabled={loading}`.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- src/app/gio-hang/page.test.tsx`

Expected: PASS with the Vietnamese anonymous redirect and English signed-in navigation covered.

- [ ] **Step 5: Commit**

```bash
git add src/app/gio-hang/page.tsx src/app/gio-hang/page.test.tsx
git commit -m "feat: require login from cart checkout"
```

### Task 2: Protect direct order creation on the API

**Files:**
- Modify: `backend/src/orders/orders.controller.ts:10-46`
- Modify: `backend/src/orders/orders.controller.spec.ts:1-70`

**Interfaces:**
- Consumes: `JwtAuthGuard`, which populates `request.user: AccessTokenPayload` or rejects the request with `401`.
- Produces: `POST /orders` that always associates the created order with `request.user.sub`.

- [ ] **Step 1: Write the failing guard-metadata test**

```ts
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

it("requires a JWT before accepting an order", () => {
  expect(
    Reflect.getMetadata(
      GUARDS_METADATA,
      OrdersController.prototype.createOrder,
    ),
  ).toEqual([JwtAuthGuard]);
});
```

- [ ] **Step 2: Run the API test to verify it fails**

Run: `npm test -- src/orders/orders.controller.spec.ts`

Expected: FAIL because `createOrder` currently uses `OptionalJwtAuthGuard`.

- [ ] **Step 3: Require the customer JWT in the controller**

```ts
@Post()
@UseGuards(JwtAuthGuard)
async createOrder(
  @Body() input: CreateOrderDto,
  @Req() request: { user: AccessTokenPayload },
) {
  const order = await this.ordersService.createOrder(input, request.user.sub);
  // Keep the existing PayOS and non-PayOS response branches unchanged.
}
```

Remove the guest-only controller test because it directly invokes the handler outside Nest guards. Keep the authenticated-order test and assert its user ID is forwarded.

- [ ] **Step 4: Run the API test to verify it passes**

Run: `npm test -- src/orders/orders.controller.spec.ts`

Expected: PASS with the required guard and authenticated customer association covered.

- [ ] **Step 5: Commit**

```bash
git add backend/src/orders/orders.controller.ts backend/src/orders/orders.controller.spec.ts
git commit -m "fix: protect order creation with customer auth"
```

### Task 3: Verify the integrated flow locally

**Files:**
- Modify: none

**Interfaces:**
- Consumes: the cart action, customer session provider, `CustomerGate` safe `next` handling, and the protected order endpoint.
- Produces: evidence that the built frontend and backend retain the authenticated checkout flow.

- [ ] **Step 1: Run all automated verification**

Run: `npm test && npm run build && (cd backend && npm test && npm run build)`

Expected: all frontend and backend test suites and builds exit with code `0`.

- [ ] **Step 2: Start local development**

Run: `npm run dev -- --port 3000`

Expected: Next.js reports readiness at `http://localhost:3000`.

- [ ] **Step 3: Smoke-test the browser route**

Use Playwright with a cart line in local storage, press the checkout button, and assert the browser URL becomes `http://localhost:3000/dang-nhap?next=%2Fthanh-toan` for an anonymous session.

- [ ] **Step 4: Stop the local server after the check**

Send an interrupt to the development-server process so no background process is left running.
