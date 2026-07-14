# Premium Aerospace Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign every Vietnamese and English public page as a premium aerospace and education brand while preserving and improving the interactive 3D drone lab.

**Architecture:** Keep content schemas, route structure, server-rendered pages, and SEO helpers unchanged. Establish global visual tokens and typography, then update shared chrome and card primitives so listing routes inherit the new system; finally reshape the homepage, 3D overlay, and product/article detail compositions. Client-side code remains limited to locale-aware chrome and the WebGL showroom.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript, Tailwind CSS 4, React Three Fiber, Drei, Three.js, Lucide React, Vitest, Testing Library.

## Global Constraints

- Preserve the existing five-station 3D hero, scroll-driven camera, pointer parallax, test fallback, and reduced-motion behavior.
- Use Newsreader for display typography and Manrope for body/interface typography through `next/font/google` with `vietnamese` subsets.
- Use `#071117`, `#10232A`, `#F5F7F4`, `#172226`, `#00A99B`, and `#D69C54` as the core palette; reserve `#00D1C1` for emitted light inside the 3D scene.
- Preserve all routes, content loader APIs, structured SEO, Zalo CTA destination, and safe external-link attributes.
- Do not add a CMS, database, filters, authentication, animation library, photographic assets, or new product data fields.
- Support 360 px mobile width, visible keyboard focus, 44 px touch targets, readable contrast, and `prefers-reduced-motion`.
- Read relevant Next.js 16 guides under `node_modules/next/dist/docs/` before production edits.

---

### Task 1: Global typography and localized site chrome

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/components/localized-chrome.tsx`
- Modify: `src/components/home-page.test.tsx`

**Interfaces:**
- Consumes: `SiteContent`, `Locale`, and current pathname locale helpers.
- Produces: `SiteHeader` with `homeHref` and `locale`; `SiteFooter` with `locale`; global `--font-display`, `--font-body`, and premium palette variables.

- [ ] **Step 1: Add failing localized chrome expectations**

Add a test that renders `SiteHeader` with `homeHref="/en"` and English labels, then asserts the brand link is `/en`, the navigation has an English accessible label, and the consultation CTA remains external with `noopener noreferrer`. Add a footer assertion for the localized institutional descriptor.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/components/home-page.test.tsx`

Expected: FAIL because `homeHref` and `locale` are not accepted and English chrome copy is absent.

- [ ] **Step 3: Implement typography, tokens, and chrome**

Replace Geist/Geist Mono with variable `Newsreader` and `Manrope` instances using `subsets: ["latin", "vietnamese"]`. Apply both CSS variables on `<html>`. Expand global tokens, focus styles, display typography utility, and surface defaults in `globals.css`.

Update header and footer props:

```ts
type SiteHeaderProps = {
  brandName: string;
  navigation: LinkItem[];
  primaryCta: LinkItem;
  homeHref?: string;
  locale?: "vi" | "en";
  languageSwitch?: LinkItem;
};
```

Use a restrained wing/airframe wordmark, calm desktop navigation, a compact locale switch, and a mobile horizontal nav without pill-heavy styling. Pass `homeHref` and `locale` from `LocalizedChrome` based on pathname.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/components/home-page.test.tsx src/lib/i18n.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/components/site-header.tsx src/components/site-footer.tsx src/components/localized-chrome.tsx src/components/home-page.test.tsx
git commit -m "feat: establish premium brand chrome"
```

### Task 2: Editorial shells and localized content cards

**Files:**
- Modify: `src/components/section-shell.tsx`
- Modify: `src/components/drone-card.tsx`
- Modify: `src/components/curriculum-card.tsx`
- Modify: `src/components/service-card.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/routes.test.tsx`
- Modify: `src/app/en/curriculum/page.tsx`
- Modify: `src/app/en/services/page.tsx`
- Modify: `src/app/tin-tuc/page.tsx`
- Modify: `src/app/en/news/page.tsx`

**Interfaces:**
- Consumes: existing `DroneModel`, `CurriculumItem`, `Service`, and route page props.
- Produces: `CurriculumCard({ item, href? })` and `ServiceCard({ service, href?, tone? })`, with current Vietnamese defaults retained.

- [ ] **Step 1: Add failing link and semantic hierarchy tests**

Extend shared component tests with:

```tsx
render(<CurriculumCard item={getCurriculumItems("en")[0]} href="/en/curriculum#drone-basics-grade-school" />);
expect(screen.getByRole("link", { name: "View lesson plan" })).toHaveAttribute(
  "href",
  "/en/curriculum#drone-basics-grade-school",
);
```

Add the equivalent English `ServiceCard` expectation and assert the news listing uses an `<article>` around each story link.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/components/home-page.test.tsx src/app/routes.test.tsx`

Expected: FAIL because curriculum/service href overrides and article semantics are not implemented.

- [ ] **Step 3: Implement editorial section and card system**

Restyle `SectionShell` with larger editorial headings, controlled measure, tonal light/dark surfaces, and a thin meaningful rule. Recompose drone, curriculum, and service cards with fewer icons, larger product fields, calmer borders, stronger typography, and explicit CTA destinations. Pass English hrefs from English curriculum and service pages. Recompose both article listings as editorial article rows/cards while preserving dates and summaries.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/components/home-page.test.tsx src/app/routes.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/section-shell.tsx src/components/drone-card.tsx src/components/curriculum-card.tsx src/components/service-card.tsx src/components/home-page.test.tsx src/app/routes.test.tsx src/app/en/curriculum/page.tsx src/app/en/services/page.tsx src/app/tin-tuc/page.tsx src/app/en/news/page.tsx
git commit -m "feat: redesign editorial catalog components"
```

### Task 3: Premium homepage and upgraded 3D product placard

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/drone-lab-showroom.tsx`
- Modify: `src/components/drone-lab-showroom.test.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/routes.test.tsx`

**Interfaces:**
- Consumes: `locale`, `SiteContent`, drone/service loaders, and current Three.js station scene.
- Produces: `DroneLabShowroomProps` with `locale: Locale`; localized overlay labels and fully localized homepage section copy.

- [ ] **Step 1: Add failing localization and showroom-copy tests**

Add English homepage expectations for “A drone platform for every stage of learning”, “From first flight to a working lab”, and “A clear path from brief to deployment”. Add a Vietnamese showroom test for “Cấu hình đang giới thiệu” and an English showroom test for “Featured configuration”.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/components/drone-lab-showroom.test.tsx src/app/routes.test.tsx`

Expected: FAIL because section and placard copy are hard-coded or missing.

- [ ] **Step 3: Implement localized editorial homepage**

Create a typed local copy object inside `page.tsx` keyed by `Locale`. Replace the four equal solution tiles with an asymmetric featured catalog where the first item spans more space, preserve three concise service pillars, and retain the meaningful three-step deployment sequence. Use display typography and a restrained flight-path SVG with `aria-hidden="true"`.

In the showroom, accept `locale`, localize the placard, simplify HUD-like labels, refine room lighting/material roughness, improve the dark overlay balance, and create a curved light-to-paper transition at the lower edge. Keep all camera, pointer, station, fallback, and reduced-motion logic.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/components/drone-lab-showroom.test.tsx src/components/home-page.test.tsx src/app/routes.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/drone-lab-showroom.tsx src/components/drone-lab-showroom.test.tsx src/components/home-page.test.tsx src/app/routes.test.tsx
git commit -m "feat: elevate interactive drone showroom"
```

### Task 4: Premium product detail and editorial article detail

**Files:**
- Modify: `src/components/product-detail.tsx`
- Modify: `src/app/tin-tuc/[slug]/page.tsx`
- Modify: `src/app/en/news/[slug]/page.tsx`
- Modify: `src/app/product-detail-routes.test.tsx`
- Modify: `src/app/routes.test.tsx`

**Interfaces:**
- Consumes: current `ProductDetail({ drone, locale })`, SEO builders, article loader results.
- Produces: the same public component and route signatures with new semantic sections and unchanged JSON-LD.

- [ ] **Step 1: Add failing product and article experience tests**

Assert Vietnamese and English product detail pages expose localized consultation links to `https://zalo.me/0384070636`, render a specification heading and FAQ heading, and keep product names as the single level-one heading. Assert article detail renders a `<time dateTime="2026-07-05">` element.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/app/product-detail-routes.test.tsx src/app/routes.test.tsx`

Expected: FAIL because article dates are plain paragraphs and product semantics do not match the new contract.

- [ ] **Step 3: Implement detail compositions**

Recompose product detail into a media-led hero, audience/use-case line, consultation CTA, specification table, outcome section, related service section, and quiet FAQ list. Preserve Product, Breadcrumb, FAQ, and Service JSON-LD. Recompose both article routes with editorial measure, Newsreader title styling, semantic `<time>`, and readable paragraphs.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/app/product-detail-routes.test.tsx src/app/routes.test.tsx src/lib/seo.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/product-detail.tsx src/app/tin-tuc/'[slug]'/page.tsx src/app/en/news/'[slug]'/page.tsx src/app/product-detail-routes.test.tsx src/app/routes.test.tsx
git commit -m "feat: refine product and editorial detail pages"
```

### Task 5: Full verification and visual polish

**Files:**
- Modify if required by evidence: files changed in Tasks 1–4 only.

**Interfaces:**
- Consumes: complete redesigned route set.
- Produces: a lint-clean, test-clean, production-buildable responsive site.

- [ ] **Step 1: Run the automated suite**

Run: `npm test && npm run lint && npm run build`

Expected: 9 test files and all tests PASS, ESLint exits 0, Next.js production build exits 0.

- [ ] **Step 2: Start the production server and capture evidence**

Run: `npm run start` after build. Capture 1440×1100 and 390×844 screenshots for `/`, `/san-pham`, and `/san-pham/dv-primary-lab`; capture at least one English route to validate localized layout.

- [ ] **Step 3: Inspect and correct evidenced visual issues**

Check hero overlay contrast, 3D visibility, font loading, horizontal overflow, navigation wrapping, content measure, card alignment, visible focus, English link destinations, and reduced-motion behavior. Apply only corrections supported by the screenshots or browser inspection.

- [ ] **Step 4: Re-run verification after polish**

Run: `npm test && npm run lint && npm run build`

Expected: all commands exit 0 with no warnings introduced by the redesign.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "chore: polish premium responsive interface"
```
