# Drone Viet Commerce Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Drone Viet commerce platform whose storefront closely follows the information architecture, layout, interaction density, and purchasing flow of the public DJI Store while using independent Drone Viet identity, content, and licensed assets.

**Architecture:** Keep the existing Next.js 16 application as the public storefront and admin console. Add a dedicated NestJS commerce API that owns catalog, inventory, carts, checkout, payments, shipping, quotes, enrollment, and notifications. MySQL holds transactional data, Redis handles short-lived cart state, locks, and jobs, and S3-compatible object storage holds licensed product and course media.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, NestJS 10, TypeORM 0.3, MySQL 8, Redis, BullMQ, PayOS, VNPAY adapter, Viettel Post adapter, Cloudflare R2 or compatible S3 storage, Docker Compose, Playwright, Vitest.

## Global Constraints

- Keep the existing Vietnamese and English routes working, including `/san-pham/[slug]`, `/giao-trinh`, and their English equivalents.
- Use only Drone Viet-owned or properly licensed product images, videos, icons, and copy. Do not reuse DJI assets, content, or brand identifiers.
- Show every sellable amount in VND integer minor units; all price, discount, tax, shipping, and total calculations run on the server.
- Treat the browser as untrusted: reprice cart lines, verify inventory, reserve stock, and validate payment callbacks on the API.
- Build payment integrations behind a provider interface. PayOS is the first live implementation; VNPAY is the second provider, not a checkout fork.
- Storefront commerce surfaces use a neutral sans font for scanability. Do not use the current Playwrite display font for prices, cart, checkout, admin, or dense navigation.
- All order state transitions produce an audit event. Payment webhook handling must verify signature, amount, order binding, and idempotency.
- Preserve the existing static content loader during migration; seed the commercial catalog from it rather than replacing pages in one release.

## Reference Findings

The current Drone Viet project is a static Next.js 16 product and curriculum site. Its `DroneModel` schema already has editorial product data, while its content and pages have no price, SKU, inventory, cart, order, payment, or admin concepts.

`wemake` provides useful production patterns, not a source tree to copy:

- `backend/src/payments/payments.service.ts` creates a pending payment before redirecting and validates PayOS webhook signature, amount, and completed status idempotently.
- `backend/src/shipping/shipping.service.ts` isolates carrier estimation and retains a manual-contact fallback.
- `backend/src/orders/orders.service.ts` reprices server-side, snapshots order lines, records shipping and promotions, then emits notifications.
- `frontend/src/app/admin/` contains catalog, order, promotion, user, and settings workflows. Drone Viet should split these responsibilities into smaller features and use role-based access control instead of `ADMIN_EMAILS` alone.

The editable architecture diagram is [2026-08-16-droneviet-commerce-platform.drawio](2026-08-16-droneviet-commerce-platform.drawio).

## Target Boundaries

```text
Browser
  -> Next.js storefront and /admin
  -> same-origin BFF proxy
  -> NestJS Commerce API
       -> MySQL: catalog, orders, enrollment, audit
       -> Redis: cart sessions, stock reservation, async jobs
       -> R2/S3: product and course assets
       -> PayOS/VNPAY: payment links and signed callbacks
       -> Viettel Post/GHN: delivery quotes and fulfillment
       -> Email/Zalo OA: transactional notifications
```

### API modules

| Module | Owns | Public operations |
| --- | --- | --- |
| `auth` | customer and staff identities, sessions, RBAC | register, login, refresh, profile, admin guard |
| `catalog` | product families, variants, accessories, bundles, media, collections | browse, filter, detail, compare |
| `inventory` | on-hand, reserved, low-stock thresholds, movements | availability, reserve, release, adjust |
| `cart` | guest and account carts, price snapshots | add, update, merge, validate |
| `orders` | order snapshots, order state machine, cancellation, tracking | create, detail, cancel, reorder |
| `payments` | payment attempts and provider callbacks | create checkout, callback, resume, refund record |
| `shipping` | addresses, rates, labels, delivery status | quote, select rate, fulfill, track |
| `courses` | course definitions, scheduled sessions, seats, enrollment, attendance | browse, enroll, staff roster |
| `quotes` | institutional lab briefs, line items, revision, approval | create quote request, approve, convert to order |
| `promotions` | codes, campaigns, eligibility, usage caps | validate, apply, record usage |
| `content` | Markdown documents, article metadata, product long descriptions, revisions, publishing | public article/product content, staff preview, publish |
| `notifications` | transactional email and Zalo events | enqueue and retry messages |
| `admin` | operational queries and controlled mutations | catalog, orders, inventory, courses, quotes, reports |

### Core data model

| Aggregate | Required fields and rules |
| --- | --- |
| `Product` | `id`, `slug`, `kind`, `status`, localized name/summary, brand-neutral media, weight, warranty, education level, SEO fields |
| `ProductVariant` | `sku`, `product_id`, `title`, `price_vnd`, `compare_at_vnd`, `cost_vnd`, `weight_g`, `purchase_mode`, `is_active` |
| `InventoryItem` | `variant_id`, `on_hand`, `reserved`, `reorder_point`; never allow a checkout to use more than `on_hand - reserved` |
| `Bundle` | named drone or course kit with required and optional `BundleItem` variant lines; resolves price on the API |
| `Course` | localized course content, target level, outcomes, default tuition, kit recommendation, delivery mode |
| `CourseSession` | `course_id`, instructor, dates, room or meeting URL, capacity, reserved seats, enrollment status |
| `ProductContent` | `product_id`, locale, short description, Markdown body, generated table of contents, SEO metadata, published revision |
| `Article` | slug, locale, title, excerpt, Markdown body, cover media, author, tags, SEO fields, scheduled/published state |
| `ContentRevision` | aggregate type/ID, Markdown source, structured metadata snapshot, editor, revision number, publish timestamp |
| `Cart` and `CartLine` | guest token or user ID, variant snapshot, quantity, quoted price, expiry; revalidated before checkout |
| `Order` and `OrderLine` | order number, contact/shipping snapshot, immutable item title/SKU/price/tax/discount snapshots, state history |
| `PaymentAttempt` | provider, provider reference, expected amount, status, callback payload hash, paid timestamp; unique provider reference |
| `Shipment` | carrier, selected service, rate, label, tracking number, delivery state |
| `QuoteRequest` | school/company contact, desired lab configuration, expected quantity, budget, staff owner, revision history |
| `AuditEvent` | actor, aggregate type/ID, previous state, next state, metadata, timestamp |

## Storefront Experience

### Routes

- `/cua-hang`: all device collections, search, filters, featured bundles, compare launcher.
- `/cua-hang/[collection]`: Camera drones, research platforms, education kits, accessories, and seasonal bundles.
- `/san-pham/[slug]`: preserve current route; replace the editorial-only CTA with configurable variant, delivery, purchase, quote, and cross-sell areas.
- `/so-sanh`: side-by-side technical comparison for up to three product families.
- `/khoa-hoc` and `/khoa-hoc/[slug]`: course catalog, upcoming sessions, seats, tuition, included kit, enrollment CTA.
- `/gio-hang`, `/thanh-toan`, `/don-hang/[number]`, `/theo-doi-don/[number]`: cart through post-purchase lifecycle.
- `/tai-khoan/*`: orders, addresses, enrollments, wish list, profile.
- `/admin/*`: role-gated catalog, inventory, courses, orders, quotes, promotions, customers, settings, reports, audit.

### High-fidelity DJI Store frontend reference

- Match the DJI Store shell: compact utility strip, crisp white desktop navigation, category mega menu, search, account, country/language selection, and cart count. Mobile uses a full-height navigation sheet and a separate search surface.
- Match the homepage composition: full-bleed product carousel, icon-based category rail, repeated product-column sections with one dominant device and supporting items, accessory strips, editorial guides, and a dense trust/footer area.
- Match catalog density: persistent desktop filter rail, compact sort/count toolbar, light-grey media fields, minimal product tiles, clear price/status hierarchy, compare selection, and a compact mobile filter drawer.
- Match the product detail purchase pattern: media gallery beside a fixed purchase panel, option and combo selector rows, price/availability/shipping block, add-to-cart action, recommended accessories, comparison, and a sticky mobile purchase bar.
- Use real product photography or video with DJI-like large clean framing. Do not use gradients, decorative vector scenes, DJI logos, DJI product photography, DJI copy, or DJI brand names.
- Keep a neutral sans face, near-white, black, and cold-grey commerce palette. Drone Viet teal is limited to selected states, operational status, and primary action emphasis. Corner radii stay at 8px or below.
- Put `Drone + course + accessory` combinations in a bundle drawer rather than burying learning content below generic marketing copy.
- Provide an accessible filter drawer, keyboard-safe image gallery, semantic price labels, loading skeletons with fixed dimensions, and focus states for all interactive controls.

### Frontend feature baseline

| Surface | Required behavior |
| --- | --- |
| Home | Hero carousel, direct product CTAs, icon category rail, featured product columns, course and bundle modules, guide cards, trust and support footer |
| Navigation | Category mega menu with image and secondary links, debounced search, account menu, cart drawer/count, mobile menu and search sheet |
| Catalog | URL-backed filters, sort, availability labels, price-from display, compare selection, pagination or progressive loading, product quick view only for unconfigured variants |
| Product detail | Gallery, video, variant and combo configuration, compatibility checking, shipping promise, quote-only branch, accessory upsell, compare, product FAQ, course cross-sell |
| Course detail | Session selector, seats remaining, enrollment CTA, hardware-kit add-on, syllabus, instructor, outcomes, institution quote branch |
| Cart and checkout | Bundle grouping, compatibility warnings, live price summary, delivery estimate, coupon state, guest checkout, payment redirect state, retry/cancel state |
| Account | Order tracking, invoices, saved addresses, course enrollments, quote history, saved products |
| Admin | Dense operational tables, product/media editor, Markdown product/article CMS, SKU and inventory controls, order workbench, payment review, course roster, quote pipeline, audit history |

## Delivery Plan

### Phase 1: Platform foundation and domain contracts

**Files:**
- Create: `backend/package.json`, `backend/src/app.module.ts`, `backend/src/main.ts`
- Create: `backend/src/database/data-source.ts`, `backend/src/database/migrations/*`, `backend/src/database/seed-catalog.ts`
- Create: `backend/src/common/money/money.ts`, `backend/src/common/audit/audit-event.entity.ts`
- Create: `docker-compose.yml`, `docker-compose.prod.yml`, `.env.example`
- Modify: `package.json`, `src/lib/content/schema.ts`, `src/content/data/site.ts`

**Interfaces:**

```ts
export type MoneyVnd = number;

export interface PriceBreakdown {
  subtotalVnd: MoneyVnd;
  discountVnd: MoneyVnd;
  shippingVnd: MoneyVnd;
  totalVnd: MoneyVnd;
}

export interface ProductVariantSnapshot {
  variantId: string;
  sku: string;
  title: string;
  unitPriceVnd: MoneyVnd;
  quantity: number;
}
```

- [ ] Write failing unit tests for VND addition, discount bounds, and price snapshot immutability.
- [ ] Add the NestJS application with ConfigModule, TypeORM, validation pipe, Swagger in non-production, structured request IDs, and `/health`.
- [ ] Add MySQL migrations for users, roles, audit events, catalog, variants, collections, media, inventory, courses, product content, articles, content revisions, and seed data imported from existing DroneModel and CurriculumItem content.
- [ ] Add Docker development and production services for `web`, `api`, `mysql`, and `redis`; production runs migrations before serving traffic.
- [ ] Verify API unit tests, migration-up/migration-down, seeded catalog, and Next.js regression tests pass.

### Phase 2: Catalog, media, and public discovery

**Files:**
- Create: `backend/src/catalog/*`, `backend/src/media/*`, `backend/src/inventory/*`, `backend/src/content/*`
- Create: `src/features/catalog/*`, `src/components/store/product-tile.tsx`, `src/components/store/catalog-filter.tsx`
- Create: `src/app/cua-hang/page.tsx`, `src/app/cua-hang/[collection]/page.tsx`, `src/app/so-sanh/page.tsx`
- Modify: `src/app/san-pham/page.tsx`, `src/app/san-pham/[slug]/page.tsx`, `src/lib/seo.ts`

**Interfaces:**

```ts
export interface CatalogQuery {
  collection?: string;
  level?: string;
  useCase?: string;
  minPriceVnd?: number;
  maxPriceVnd?: number;
  availability?: "in_stock" | "preorder" | "quote_only";
  sort?: "featured" | "price_asc" | "price_desc";
}
```

- [ ] Write failing API tests for collection filtering, availability filtering, stable sort, and non-public catalog records.
- [ ] Implement catalog read endpoints and signed media upload endpoints; store only asset metadata in MySQL.
- [ ] Build the `/cua-hang` list and collection pages with URL-backed filters, pagination, compare selection, and responsive quick-category navigation.
- [ ] Upgrade product JSON-LD to include real price and availability only when a variant is publicly purchasable.
- [ ] Verify filter state survives reload and mobile/desktop screenshots have no overflow or text collision.

### Phase 2B: Admin catalog CMS and safe Markdown publishing

**Files:**
- Create: `backend/src/content/entities/article.entity.ts`, `backend/src/content/entities/content-revision.entity.ts`
- Create: `backend/src/content/content.controller.ts`, `backend/src/content/content.service.ts`, `backend/src/content/markdown-renderer.service.ts`
- Create: `src/app/admin/products/page.tsx`, `src/app/admin/products/new/page.tsx`, `src/app/admin/products/[id]/page.tsx`
- Create: `src/app/admin/articles/page.tsx`, `src/app/admin/articles/new/page.tsx`, `src/app/admin/articles/[id]/page.tsx`
- Create: `src/components/admin/product-editor/*`, `src/components/admin/article-editor/*`
- Create: `src/components/content/markdown-document.tsx`, `src/lib/markdown/render.ts`
- Modify: `src/app/tin-tuc/page.tsx`, `src/app/tin-tuc/[slug]/page.tsx`, `src/components/product-detail.tsx`

**Interfaces:**

```ts
export interface MarkdownDocumentInput {
  title: string;
  excerpt?: string;
  bodyMarkdown: string;
  coverMediaId?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: "draft" | "scheduled" | "published";
  publishedAt?: string;
}

export interface ProductVariantInput {
  sku: string;
  title: string;
  priceVnd: number;
  compareAtVnd?: number;
  purchaseMode: "checkout" | "preorder" | "quote_only";
  optionValueIds: string[];
  inventoryOnHand: number;
}
```

- [ ] Write failing tests proving an editor can save a draft, preview it, publish it, and restore a prior revision without exposing a draft on a public route.
- [ ] Write failing tests that reject unsafe HTML, scripts, event-handler attributes, unsafe URLs, and malformed Markdown embeds before rendering.
- [ ] Add a shared Markdown pipeline using `remark`, `rehype-sanitize`, `rehype-slug`, and `rehype-autolink-headings`. Render Markdown on the server; allow only an explicit HTML/URL allowlist and never render raw unsanitized HTML.
- [ ] Build the product editor as sections: identity, collections, media, long description Markdown, variants/SKUs, price, inventory, option groups, compatibility, bundle membership, SEO, preview, and publish history.
- [ ] Build the article editor as sections: title/slug, cover, summary, Markdown body with split preview, tags, related product/course links, SEO, schedule, revision history, and publish controls.
- [ ] Store Markdown source plus a revision record. Generate sanitized HTML and table-of-contents data during preview/publish; invalidate public product/article cache tags only after a successful publish transaction.
- [ ] Keep product price and configuration fields in typed forms and API DTOs. Markdown can describe a product but cannot define SKU prices, discounts, availability, compatibility, or purchase mode.
- [ ] Verify Markdown article, Markdown product description, draft preview, published SEO metadata, and article/product rendering in Vietnamese and English through Playwright.

### Phase 3: Product, bundle, course, and quote conversion

**Files:**
- Create: `backend/src/bundles/*`, `backend/src/courses/*`, `backend/src/quotes/*`
- Create: `src/features/product-configurator/*`, `src/features/courses/*`, `src/features/quotes/*`
- Create: `src/app/khoa-hoc/[slug]/page.tsx`, `src/app/bao-gia/page.tsx`
- Modify: `src/components/product-detail.tsx`, `src/components/curriculum-card.tsx`, `src/app/giao-trinh/page.tsx`

**Interfaces:**

```ts
export type PurchaseMode = "checkout" | "preorder" | "quote_only";

export interface ConfigureProductRequest {
  variantId: string;
  accessoryVariantIds: string[];
  courseSessionId?: string;
  quantity: number;
}
```

- [ ] Write failing tests for valid/invalid bundle configurations, capacity limits, quote-only products, and course-seat reservation.
- [ ] Add product variant, bundle, and course-session endpoints that return an API-calculated configuration and delivery weight.
- [ ] Build the PDP gallery, variant and accessory selection, bundle summary, course cross-sell, compare link, and mobile sticky action bar.
- [ ] Build course detail and institutional quote flows; quote requests include organization, contact, desired product lines, quantity, budget, and implementation requirements.
- [ ] Verify a buyer can configure a purchasable combo, while a lab-only configuration produces a quote request rather than a cart line.

### Phase 4: Cart, inventory reservation, checkout, and shipping

**Files:**
- Create: `backend/src/cart/*`, `backend/src/orders/*`, `backend/src/shipping/*`
- Create: `src/features/cart/*`, `src/features/checkout/*`, `src/lib/api/commerce.ts`
- Create: `src/app/gio-hang/page.tsx`, `src/app/thanh-toan/page.tsx`, `src/app/don-hang/[number]/page.tsx`

**Interfaces:**

```ts
export interface CheckoutRequest {
  cartId: string;
  contact: { name: string; phone: string; email?: string };
  address?: { provinceCode: string; wardCode: string; line1: string };
  shippingRateId?: string;
  paymentMethod: "payos" | "cod" | "bank_transfer";
  promotionCode?: string;
}
```

- [ ] Write failing tests proving checkout reprices stale cart lines, rejects oversold variants, and releases expired reservations.
- [ ] Implement guest-cart token, account-cart merge, server-side price calculation, stock reservation, and an order transaction that writes immutable line snapshots and an audit event.
- [ ] Implement Viettel Post quote adapter first and manual-contact fallback. Add GHN only behind the same shipping provider interface.
- [ ] Build cart and checkout with address validation, delivery rate selection, promotion display, payment selection, and guest-account conversion after order placement.
- [ ] Verify two concurrent checkout requests cannot reserve the final unit twice and shipping amount is recalculated by the API.

### Phase 5: Payments, callbacks, notifications, and order tracking

**Files:**
- Create: `backend/src/payments/*`, `backend/src/notifications/*`, `backend/src/jobs/*`
- Create: `src/app/thanh-toan/thanh-cong/page.tsx`, `src/app/thanh-toan/huy/page.tsx`, `src/app/theo-doi-don/[number]/page.tsx`

**Interfaces:**

```ts
export interface PaymentProvider {
  create(orderId: string): Promise<{ redirectUrl: string; providerReference: string }>;
  verifyCallback(payload: unknown, signature: string): Promise<{ providerReference: string; amountVnd: number; status: "paid" | "failed" | "cancelled" }>;
}
```

- [ ] Write failing tests for duplicate callback, invalid signature, mismatched amount, callback after cancellation, and payment retry.
- [ ] Implement PayOS checkout link creation, callback signature validation, provider-reference uniqueness, idempotent paid transition, and payment success notification. Follow the verification pattern in `wemake/backend/src/payments/payments.service.ts`.
- [ ] Implement COD and bank-transfer as recorded payment attempts with operations confirmation; add VNPAY as a second PaymentProvider adapter after PayOS passes sandbox acceptance.
- [ ] Add BullMQ jobs for email/Zalo OA messages, invoice/confirmation generation, reservation release, and callback retry observability.
- [ ] Verify provider callbacks cannot alter an order unless provider reference, signature, expected amount, and valid state transition all match.

### Phase 6: Admin, RBAC, customer accounts, and operations

**Files:**
- Create: `backend/src/auth/*`, `backend/src/admin/*`, `backend/src/promotions/*`
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/catalog/page.tsx`, `src/app/admin/orders/page.tsx`, `src/app/admin/inventory/page.tsx`, `src/app/admin/courses/page.tsx`, `src/app/admin/quotes/page.tsx`, `src/app/admin/promotions/page.tsx`
- Create: `src/app/tai-khoan/don-hang/page.tsx`, `src/app/tai-khoan/khoa-hoc/page.tsx`

**Roles:**

```ts
export type Role =
  | "super_admin"
  | "catalog_manager"
  | "operations"
  | "sales"
  | "instructor"
  | "support";
```

- [ ] Write failing authorization tests for each role, including catalog updates, inventory adjustment, order refund marking, course roster export, and quote approval.
- [ ] Implement email/password accounts with secure HttpOnly refresh cookies, password hashing, audit trails, and explicit RBAC permissions. Add Google/Zalo login only after core account and checkout flows are stable.
- [ ] Build focused admin workbenches rather than one large `AdminService`: catalog/media, inventory movements, order fulfillment, payment review, course sessions/enrollment, quotes, promotions, and reports.
- [ ] Add order state machine: `pending_payment -> paid -> packing -> shipped -> delivered`, plus `cancelled`, `payment_failed`, `refund_requested`, and `refunded` transitions with staff actor and rationale.
- [ ] Verify every privileged mutation writes an AuditEvent and unauthorized requests receive no sensitive records.

### Phase 7: Quality, security, deployment, and launch controls

**Files:**
- Create: `backend/test/*`, `e2e/storefront.spec.ts`, `e2e/admin.spec.ts`, `e2e/checkout.spec.ts`
- Create: `.github/workflows/ci.yml`, `infra/nginx/*`, `docs/operations/droneviet-commerce-runbook.md`
- Modify: `README.md`, `src/app/sitemap.ts`, `src/app/robots.ts`

- [ ] Add API contract tests, checkout/payment integration tests with provider fakes, and Playwright tests for browse-to-order, course enrollment, quote request, and RBAC workflows.
- [ ] Add accessibility checks for keyboard navigation, form errors, image alt text, price announcements, and mobile sticky purchase controls.
- [ ] Deploy Docker services behind TLS reverse proxy; run migrations as a release step, expose health endpoints, back up MySQL daily, and apply lifecycle rules to media storage.
- [ ] Add error tracking, structured logs with order/payment correlation IDs, rate limits for auth/checkout/webhook routes, and alerting for failed jobs and payment callback mismatch.
- [ ] Verify production-like staging uses PayOS sandbox, carrier sandbox, seeded product media, rollback-safe migrations, and a restore drill before launch.

## Launch Sequence

1. Launch catalog, product detail, course discovery, and quote workflow with real inventory but no public card payment.
2. Enable guest cart, COD/bank transfer, and Viettel Post quote after operational staff can fulfill from admin.
3. Enable PayOS in production after signed callback, duplicate callback, amount mismatch, and cancellation scenarios pass in sandbox.
4. Enable VNPAY only after its adapter passes the same provider contract suite.
5. Enable promotions, wish lists, customer self-service, and course enrollment reporting after the order lifecycle is stable.

## Completion Criteria

- A visitor can discover, compare, configure, and purchase an in-stock drone bundle in VND, or request a B2B quote for a lab configuration.
- A visitor can enroll in a scheduled course and purchase an associated device kit where capacity and inventory permit.
- Checkout prices, discounts, inventory, shipping, and payment state are validated by the API, not trusted from the browser.
- Operations staff can manage catalog, inventory, orders, payments, courses, quotes, and promotions under explicit roles with audit history.
- PayOS callback processing is signed, amount-checked, idempotent, observable, and covered by automated tests.
- The storefront closely follows DJI Store's public interaction and layout conventions while remaining fast, accessible, responsive, and independently branded.
