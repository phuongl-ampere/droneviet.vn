# Drone Viet Checkout Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-form checkout with a Wemake-inspired three-step checkout that supports guest buyers, saved local addresses, delivery or showroom pickup, payment resume, and a clear order-result path.

**Architecture:** Keep final prices, promotion validation, stock reservations, and payment creation authoritative in the NestJS backend. The frontend holds only a checkout draft and an address book in browser storage, renders the three steps, and submits a normalized order payload. Reuse the current manual shipping estimate until carrier credentials and a rate provider are configured.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Vitest, NestJS, TypeORM, MySQL, PayOS.

## Global Constraints

- Retain guest checkout; signed-in buyers only receive prefilled details and a locally saved address book.
- Use only `src/i18n/locales/vi.json` and `src/i18n/locales/en.json` for UI copy.
- Preserve the existing server-side price recalculation, promotion consumption, inventory reservation, and course-seat reservation.
- Delivery remains a manual quote until a carrier integration exists; showroom pickup is free at checkout.
- Do not recreate a PayOS link for an existing pending payment; resume returns its stored pending checkout URL.
- Follow the white DJI-like content style; use teal only for focused actions and state.

---

### Task 1: Persist fulfillment snapshots on orders

**Files:**
- Create: `backend/src/database/migrations/1766920300000-checkout-fulfillment.ts`
- Create: `backend/src/database/migrations/1766920300000-checkout-fulfillment.spec.ts`
- Modify: `backend/src/orders/entities/order.entity.ts`
- Modify: `backend/src/database/data-source.ts`
- Modify: `backend/src/orders/dto/create-order.dto.ts`
- Modify: `backend/src/orders/orders.service.ts`
- Test: `backend/src/orders/orders.service.spec.ts`

**Interfaces:**
- Consumes: `CreateOrderDto` contact fields and order lines.
- Produces: `fulfillmentMethod: "delivery" | "showroom_pickup"` and `shippingNote?: string` persisted with every order.

- [ ] **Step 1: Write failing service and migration tests**

Add a test that creates an order with:

```ts
{
  fulfillmentMethod: "showroom_pickup",
  shippingAddress: "Drone Viet showroom",
  shippingNote: "Call before pickup",
}
```

Assert that `orderRepository.create` receives all three fields. Add a migration test asserting the migration adds nullable `fulfillmentMethod` and `shippingNote` columns, then backfills existing rows to `"delivery"`.

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
npm test -- backend/src/orders/orders.service.spec.ts backend/src/database/migrations/1766920300000-checkout-fulfillment.spec.ts
```

Expected: failures because the order type and migration do not exist.

- [ ] **Step 3: Add the minimal persistence contract**

Define:

```ts
export enum OrderFulfillmentMethod {
  DELIVERY = "delivery",
  SHOWROOM_PICKUP = "showroom_pickup",
}
```

Add `fulfillmentMethod` (enum, default delivery) and nullable `shippingNote` columns to `Order`; add optional matching DTO fields with enum/string validation; store them in `OrdersService.createOrder`. The forward-only migration must add both columns conditionally and set historic null methods to `delivery`.

- [ ] **Step 4: Run focused tests and verify pass**

Run the command from Step 2. Expected: all focused tests pass.

### Task 2: Add safe PayOS payment continuation

**Files:**
- Modify: `backend/src/orders/orders.controller.ts`
- Modify: `backend/src/orders/orders.service.ts`
- Modify: `backend/src/payments/payments.service.ts`
- Test: `backend/src/orders/orders.controller.spec.ts`
- Test: `backend/src/payments/payments.service.spec.ts`

**Interfaces:**
- Consumes: `POST /orders/:orderNumber/payment-resume` with optional authenticated customer and optional `{ phone }` for guests.
- Produces: `{ checkoutUrl: string }` only when the caller owns the order or supplies its matching contact phone, the order is `pending_payment`, and the method is PayOS.

- [ ] **Step 1: Write failing authorization and stored-link tests**

Cover these behaviors:

```ts
await controller.resumePayosPayment("DV-123", { phone: "0900000000" }, guestRequest)
expect(ordersService.findForPaymentResume).toHaveBeenCalledWith(
  "DV-123",
  "0900000000",
  undefined,
)
```

and verify `PaymentsService` returns the newest pending PayOS `checkoutUrl` for the order without calling `PayosService.createPaymentLink`.

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
npm test -- backend/src/orders/orders.controller.spec.ts backend/src/payments/payments.service.spec.ts
```

Expected: failure because the route and resume methods do not exist.

- [ ] **Step 3: Implement resume without duplicate links**

Add an optional-JWT guarded controller route. `OrdersService.findForPaymentResume` must authorize by `customerId` when present, otherwise compare normalized contact phone. `PaymentsService.resumePayosCheckout` must:

1. Reject non-PayOS or non-pending orders.
2. Read the latest `PaymentAttempt` with provider PayOS, status pending, and a non-null `checkoutUrl`.
3. Return that stored URL; call `createPayosCheckout` only if no pending attempt is stored.

- [ ] **Step 4: Run focused tests and verify pass**

Run the command from Step 2. Expected: all focused tests pass.

### Task 3: Build checkout transport and browser address-book helpers

**Files:**
- Create: `src/lib/commerce/checkout-address-book.ts`
- Create: `src/lib/commerce/checkout-address-book.test.ts`
- Modify: `src/lib/commerce/checkout.ts`
- Modify: `src/lib/commerce/checkout.test.ts`
- Modify: `src/lib/commerce/orders.ts`
- Create: `src/lib/commerce/orders.test.ts`

**Interfaces:**
- Produces `CheckoutAddress`, `loadCheckoutAddresses`, `saveCheckoutAddress`, `removeCheckoutAddress`.
- Extends `submitCheckout` with `fulfillmentMethod` and `shippingNote`.
- Produces `estimateShipping` and `resumePayosPayment` client calls.

- [ ] **Step 1: Write failing helper and transport tests**

Test that duplicate address saves replace by id, the most recently saved address is first, non-browser calls do not throw, checkout POST serializes:

```ts
{
  fulfillmentMethod: "delivery",
  shippingAddress: "12 Le Loi, Ben Nghe, Ho Chi Minh City",
  shippingNote: "Call on arrival",
}
```

and the resume request sends `{ phone }` to the encoded order route.

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
npm test -- src/lib/commerce/checkout-address-book.test.ts src/lib/commerce/checkout.test.ts src/lib/commerce/orders.test.ts
```

Expected: failure because the address-book and extended transport do not exist.

- [ ] **Step 3: Implement focused client helpers**

Use one versioned `localStorage` key for the address book, validate parsed values defensively, and never persist payment state. Add the exact order payload fields and typed response shape. Shipping estimate should return the existing manual quote API response and never calculate its own price.

- [ ] **Step 4: Run focused tests and verify pass**

Run the command from Step 2. Expected: all focused tests pass.

### Task 4: Replace checkout UI with three focused steps

**Files:**
- Create: `src/components/checkout/checkout-flow.tsx`
- Create: `src/components/checkout/checkout-flow.test.tsx`
- Modify: `src/app/thanh-toan/page.tsx`
- Modify: `src/app/thanh-toan/page.test.tsx`
- Modify: `src/app/en/checkout/page.tsx`
- Modify: `src/i18n/locales/vi.json`
- Modify: `src/i18n/locales/en.json`

**Interfaces:**
- Consumes cart lines, optional `CustomerSessionProvider`, address-book helpers, `estimateShipping`, and `submitCheckout`.
- Produces three UI states: `delivery`, `shipping`, and `review`; PayOS redirects, other methods route to `/thanh-toan/ket-qua`.

- [ ] **Step 1: Write failing checkout flow tests**

Add tests that:

1. Initial render exposes only Step 1 and no Step 2 content.
2. Invalid Vietnamese phone and incomplete delivery address block continue.
3. Selecting showroom pickup allows progression without address fields.
4. Continuing to review renders selected payment method, promo input, all cart lines, manual shipping note, and total.
5. A signed-in customer pre-fills name, phone, and email; a saved address can be selected.
6. A successful COD response navigates to the order result route, while a PayOS response assigns `checkoutUrl`.

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
npm test -- src/app/thanh-toan/page.test.tsx src/components/checkout/checkout-flow.test.tsx
```

Expected: failures because the existing checkout is a single form.

- [ ] **Step 3: Implement the step flow**

Create a focused client component rather than extending the page beyond its routing responsibility:

```ts
type CheckoutStep = "delivery" | "shipping" | "review";
type FulfillmentMethod = "delivery" | "showroom_pickup";
```

The delivery step has contact fields, delivery/pickup selection, local saved-address controls for signed-in users, and field-level validation. The shipping step displays the backend manual quote for delivery or free showroom pickup. The review step provides promotion code, payment cards, editable step links, item summary, and one submit action. Keep the desktop summary sticky and show the same action at the bottom on mobile.

- [ ] **Step 4: Add both-locale copy**

Add structurally identical `checkoutFlow` keys to `vi.json` and `en.json`; use `t()` for every new label, validation, status, and button string.

- [ ] **Step 5: Run focused tests and verify pass**

Run the command from Step 2 and `npm test -- src/lib/i18n.test.ts`. Expected: all pass.

### Task 5: Add the outcome and pending-payment recovery paths

**Files:**
- Create: `src/app/thanh-toan/ket-qua/page.tsx`
- Create: `src/app/thanh-toan/ket-qua/page.test.tsx`
- Create: `src/app/en/checkout/result/page.tsx`
- Modify: `src/app/theo-doi-don/page.tsx`
- Modify: `src/components/customer/customer-account.tsx`
- Modify: `src/lib/commerce/customer-api.ts`
- Modify: `src/components/customer/customer-account.test.tsx`
- Modify: `src/i18n/locales/vi.json`
- Modify: `src/i18n/locales/en.json`

**Interfaces:**
- Consumes `resumePayosPayment(orderNumber, phone?)`.
- Produces a non-PayOS result page plus resume controls in order tracking and authenticated customer order history.

- [ ] **Step 1: Write failing result and resume tests**

Test that a COD/bank-transfer result page shows order number, tracking link, and store return link. Test that a pending PayOS order found through tracking offers a continue-payment action and assigns the returned URL. Test that customer history only offers the control for `pending_payment` PayOS orders.

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
npm test -- src/app/thanh-toan/ket-qua/page.test.tsx src/components/customer/customer-account.test.tsx
```

Expected: failure because no result page or resume controls exist.

- [ ] **Step 3: Implement recovery UI**

Add a thin result page that reads an order number from the URL without storing payment secrets. Extend tracking lookup output to include payment method and show a resume button only for pending PayOS. Extend `CustomerOrder` with the fields already returned by the order service and use the authenticated resume route for owner orders.

- [ ] **Step 4: Run focused tests and verify pass**

Run the command from Step 2. Expected: all focused tests pass.

### Task 6: Verify the integrated flow

**Files:**
- Modify: any files required by test or lint fixes only.

- [ ] **Step 1: Run all automated checks**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Browser-check both viewports**

Start the local server and verify at 1440px and 390px:

1. Checkout starts with delivery step only.
2. The saved-address UI does not block guest checkout.
3. Delivery and showroom pickup progress correctly.
4. Review keeps its total and primary action visible without layout overlap.
5. Both `/thanh-toan` and `/en/checkout` render localized copy.

- [ ] **Step 3: Review changed files**

Check `git diff --check` and inspect only checkout-related changes; do not revert unrelated dirty-worktree changes.
