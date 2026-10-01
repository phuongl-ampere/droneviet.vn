# Homepage and Solutions Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage carousel and 3D-style artwork with one static image-led hero, and make Services the canonical All Solutions destination in both locales.

**Architecture:** `HomePageContent` renders a server-side, static Next Image hero from existing local photography; the Store continues to own the reusable carousel. The existing drone solution cards move to the Services routes, while `next.config.ts` owns permanent legacy redirects before filesystem route resolution. Locale dictionaries remain the only source of user-facing copy and footer navigation.

**Tech Stack:** Next.js 16.2 App Router, React, TypeScript, `next/image`, Vitest, Testing Library, Tailwind CSS.

## Global Constraints

- Keep `/cua-hang` and `/en/store` on the compact `DroneHeroCarousel`; only the two homepages become static.
- Use the existing local asset `/public/store/quadcopter-flight-01.jpg`; do not add a generated image, remote image, or 3D canvas.
- Make `/dich-vu` and `/en/services` canonical all-solution routes; redirect `/giai-phap` and `/en/solutions` with permanent Next redirects.
- Keep Vietnamese and English locale JSON structures identical.
- Do not stage `.key`, `.superpowers/`, or unrelated existing changes.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `src/app/page.tsx` | Static, image-led homepage hero and simplified featured solution card layout. |
| `src/app/routes.test.tsx` | Page-level assertions for the homepage and canonical solution listing. |
| `src/app/dich-vu/page.tsx` | Vietnamese canonical All Solutions listing. |
| `src/app/en/services/page.tsx` | English canonical All Solutions listing. |
| `src/app/giai-phap/page.tsx` | Remove after its legacy URL is redirected by Next config. |
| `src/app/en/solutions/page.tsx` | Remove after its legacy URL is redirected by Next config. |
| `src/i18n/locales/vi.json` | Vietnamese hero, SEO, solution-page, and footer navigation copy. |
| `src/i18n/locales/en.json` | English counterpart with identical key structure. |
| `next.config.ts` | Permanent redirects for the retired solution routes. |
| `next.config.test.ts` | Redirect contract tests. |
| `src/lib/i18n.ts` | Canonical Vietnamese/English route pair map. |
| `src/lib/i18n.test.ts` | Locale-switch assertion for the canonical solution pages. |
| `src/app/sitemap.ts` | Sitemap entry for canonical solution routes only. |
| `src/app/seo-routes.test.ts` | Canonical sitemap and legacy-route exclusion assertions. |
| `src/app/khoa-hoc/[slug]/page.tsx` | Course CTA points at the canonical solution route. |
| `src/app/khoa-hoc/[slug]/page.test.tsx` | Quote-only course CTA destination assertion. |

## Task 1: Replace the homepage carousel with the approved static hero

**Files:**
- Modify: `src/app/routes.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/i18n/locales/vi.json`
- Modify: `src/i18n/locales/en.json`

**Interfaces:**
- Consumes: `getSiteContent(locale)` for localized hero copy and `next/image` for the existing local image.
- Produces: `HomePageContent({ locale?: Locale })` with a `data-testid="home-static-hero"` landmark instead of a homepage `DroneHeroCarousel`.

- [ ] **Step 1: Write the failing homepage assertions in `src/app/routes.test.tsx`.**

  In the first public-route test, change the existing Vietnamese heading expectation to `Giải pháp drone cho giáo dục và nghiên cứu`, replace the carousel assertion with the following checks immediately after rendering `HomePage()`, and change the English homepage heading expectation to `Drone solutions for education and research`:

  ```tsx
  expect(screen.getByTestId("home-static-hero")).toBeInTheDocument();
  expect(
    screen.getByRole("img", {
      name: "Giải pháp drone cho giáo dục và nghiên cứu",
    }),
  ).toHaveAttribute("src", expect.stringContaining("quadcopter-flight-01.jpg"));
  expect(screen.queryByTestId("drone-hero-carousel")).not.toBeInTheDocument();
  expect(screen.queryByTestId("hero-carousel-controls")).not.toBeInTheDocument();
  expect(screen.queryByTestId("home-drone-mark")).not.toBeInTheDocument();
  ```

- [ ] **Step 2: Run the focused test and confirm the expected red failure.**

  Run: `npm test -- src/app/routes.test.tsx`

  Expected: FAIL because `home-static-hero` does not exist and the homepage still renders `drone-hero-carousel`.

- [ ] **Step 3: Implement the static hero in `src/app/page.tsx`.**

  Replace the `DroneHeroCarousel` import with `import Image from "next/image";`. Delete the `DroneMark` function and the conditional visual block in `FeaturedSolution`; add `data-testid="home-drone-mark"` nowhere. Simplify the lead-card class so it does not reserve a second grid column for artwork.

  Add this helper above `HomePageContent` and render it as the first child of the returned fragment:

  ```tsx
  function StaticHomeHero({
    eyebrow,
    title,
  }: {
    eyebrow: string;
    title: string;
  }) {
    return (
      <section
        data-testid="home-static-hero"
        className="relative isolate min-h-[28rem] overflow-hidden bg-[#071117] text-white sm:min-h-[34rem]"
      >
        <Image
          alt={title}
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="/store/quadcopter-flight-01.jpg"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#071117]/80 via-[#071117]/18 to-transparent"
        />
        <div className="relative mx-auto flex min-h-[28rem] w-full max-w-7xl items-end px-5 py-10 sm:min-h-[34rem] sm:px-8 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7DE0D7]">
              {eyebrow}
            </p>
            <h1 className="display-type mt-4 text-4xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-6xl">
              {title}
            </h1>
          </div>
        </div>
      </section>
    );
  }
  ```

  Use it in `HomePageContent` as:

  ```tsx
  <StaticHomeHero eyebrow={site.hero.eyebrow} title={site.hero.title} />
  ```

  Update `content.site.hero.title` to `Giải pháp drone cho giáo dục và nghiên cứu` in `src/i18n/locales/vi.json` and `Drone solutions for education and research` in `src/i18n/locales/en.json`. Preserve all sections after the hero and leave `src/components/drone-hero-carousel.tsx` untouched so the Store keeps its carousel.

- [ ] **Step 4: Run the focused test and confirm it turns green.**

  Run: `npm test -- src/app/routes.test.tsx`

  Expected: PASS; the homepage exposes the static image, while carousel and 3D-art test IDs are absent.

- [ ] **Step 5: Commit the focused homepage change.**

  ```bash
  git add src/app/page.tsx src/app/routes.test.tsx src/i18n/locales/vi.json src/i18n/locales/en.json
  git commit -m "feat: simplify homepage hero"
  ```

## Task 2: Make Services the bilingual All Solutions listing

**Files:**
- Modify: `src/app/routes.test.tsx`
- Modify: `src/app/dich-vu/page.tsx`
- Modify: `src/app/en/services/page.tsx`
- Modify: `src/i18n/locales/vi.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/lib/content/content.test.ts`

**Interfaces:**
- Consumes: `getDroneModels(locale)`, `DroneCard`, `SectionShell`, and the `seo` and `pages` locale dictionaries.
- Produces: canonical `/dich-vu` and `/en/services` pages that list drone solution cards at `#<drone.slug>` and expose All Solutions copy in their metadata and footer navigation.

- [ ] **Step 1: Change route and dictionary tests before the pages.**

  In `src/app/routes.test.tsx`, remove the `SolutionsPage` import and replace the separate Solutions and Services expectations with one Vietnamese Services assertion:

  ```tsx
  render(await ServicesPage());
  expect(
    screen.getByRole("heading", {
      name: "Tất cả giải pháp drone cho giáo dục và nghiên cứu",
    }),
  ).toBeInTheDocument();
  expect(screen.getByText("DV AI Vision")).toBeInTheDocument();
  expect(screen.getByText("DV Research Platform")).toBeInTheDocument();
  expect(
    screen.queryByText("Workshop và ngày hội trải nghiệm drone"),
  ).not.toBeInTheDocument();
  ```

  In `src/lib/content/content.test.ts`, add assertions that the footer navigation has exactly one canonical solution target per locale:

  ```ts
  expect(getSiteContent().navigation).toContainEqual({
    label: "Tất cả giải pháp",
    href: "/dich-vu",
  });
  expect(getSiteContent().navigation.map((item) => item.href)).not.toContain("/giai-phap");
  expect(getSiteContent("en").navigation).toContainEqual({
    label: "All solutions",
    href: "/en/services",
  });
  ```

- [ ] **Step 2: Run the focused tests and confirm the expected red failure.**

  Run: `npm test -- src/app/routes.test.tsx src/lib/content/content.test.ts`

  Expected: FAIL because Services still renders service cards and the locale navigation still lists the legacy Solutions route.

- [ ] **Step 3: Move solution rendering to the canonical Services pages.**

  In `src/app/dich-vu/page.tsx`, replace the `ServiceCard` and `getServices` imports with `DroneCard` and `getDroneModels`; use solution copy and a two-column grid:

  ```tsx
  export default async function ServicesPage() {
    const drones = getDroneModels();

    return (
      <SectionShell
        eyebrow={copy.pages.servicesEyebrow}
        title={copy.pages.servicesTitle}
        description={copy.pages.servicesDescription}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {drones.map((drone) => (
            <div key={drone.slug} id={drone.slug}>
              <DroneCard drone={drone} />
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }
  ```

  Make the equivalent English page use `getDroneModels("en")` and:

  ```tsx
  <DroneCard drone={drone} detailBasePath="/en/products" locale="en" />
  ```

- [ ] **Step 4: Update the locale dictionaries without adding mismatched keys.**

  In both locale files, keep the key structure unchanged and update these values:

  ```json
  {
    "vi": {
      "seo.servicesTitle": "Tất cả giải pháp drone",
      "seo.servicesDescription": "Giải pháp drone cho giáo dục và nghiên cứu, từ thiết bị đến nền tảng và triển khai.",
      "pages.servicesEyebrow": "Tất cả giải pháp",
      "pages.servicesTitle": "Tất cả giải pháp drone cho giáo dục và nghiên cứu",
      "pages.servicesDescription": "Chọn cấu hình phù hợp cho lớp học, trung tâm STEM, đại học và phòng lab nghiên cứu."
    },
    "en": {
      "seo.servicesTitle": "All drone solutions",
      "seo.servicesDescription": "Drone solutions for education and research, from hardware to platforms and delivery.",
      "pages.servicesEyebrow": "All solutions",
      "pages.servicesTitle": "All drone solutions for education and research",
      "pages.servicesDescription": "Choose the right configuration for classrooms, STEM centers, universities, and research labs."
    }
  }
  ```

  In each `content.site.navigation` array, replace the Solutions item with the one canonical All Solutions item and remove the former Services item. Change all remaining audience links from `/giai-phap` to `/dich-vu` and from `/en/solutions` to `/en/services`.

- [ ] **Step 5: Run the focused tests and confirm they turn green.**

  Run: `npm test -- src/app/routes.test.tsx src/lib/content/content.test.ts src/lib/i18n.test.ts`

  Expected: PASS; Services renders drone solution cards, both locale dictionaries stay structurally aligned, and no footer navigation entry targets the retired route.

- [ ] **Step 6: Commit the canonical solution pages and copy.**

  ```bash
  git add src/app/dich-vu/page.tsx src/app/en/services/page.tsx src/app/routes.test.tsx src/i18n/locales/vi.json src/i18n/locales/en.json src/lib/content/content.test.ts
  git commit -m "feat: make services the all solutions destination"
  ```

## Task 3: Redirect retired routes and update route consumers

**Files:**
- Create: `next.config.test.ts`
- Modify: `next.config.ts`
- Delete: `src/app/giai-phap/page.tsx`
- Delete: `src/app/en/solutions/page.tsx`
- Modify: `src/lib/i18n.ts`
- Modify: `src/lib/i18n.test.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/seo-routes.test.ts`
- Modify: `src/app/khoa-hoc/[slug]/page.tsx`
- Modify: `src/app/khoa-hoc/[slug]/page.test.tsx`

**Interfaces:**
- Consumes: Next 16 `NextConfig.redirects`, canonical locale map, static sitemap pairs, and the quote-only course CTA.
- Produces: permanent 308 redirects from the two retired paths; no sitemap, locale toggle, or internal CTA targets a retired route.

- [ ] **Step 1: Write the failing redirect and canonical-route tests.**

  Create `next.config.test.ts`:

  ```ts
  import { describe, expect, it } from "vitest";
  import nextConfig from "./next.config";

  describe("legacy solution redirects", () => {
    it("permanently redirects the retired Vietnamese and English routes", async () => {
      expect(nextConfig.redirects).toBeDefined();
      const redirects = await nextConfig.redirects!();

      expect(redirects).toEqual(
        expect.arrayContaining([
          { source: "/giai-phap", destination: "/dich-vu", permanent: true },
          { source: "/en/solutions", destination: "/en/services", permanent: true },
        ]),
      );
    });
  });
  ```

  Add the following to `src/lib/i18n.test.ts`:

  ```ts
  it("switches between the canonical solution pages", () => {
    expect(getAlternateLocaleHref("/dich-vu", "vi")).toBe("/en/services");
    expect(getAlternateLocaleHref("/en/services", "en")).toBe("/dich-vu");
  });
  ```

  In the sitemap test, assert canonical entries are present and legacy entries are absent:

  ```ts
  expect(urls).toContain("https://droneviet.vn/dich-vu");
  expect(urls).toContain("https://droneviet.vn/en/services");
  expect(urls).not.toContain("https://droneviet.vn/giai-phap");
  expect(urls).not.toContain("https://droneviet.vn/en/solutions");
  ```

  Add a second course-detail test for a quote-only course:

  ```tsx
  it("links quote-only courses to the canonical solution page", async () => {
    render(
      <CartProvider>
        {await CourseDetailPage({
          params: Promise.resolve({ slug: "phuong-phap-nghien-cuu-voi-drone" }),
        })}
      </CartProvider>,
    );

    expect(screen.getByRole("link", { name: "Thảo luận phương án triển khai" }))
      .toHaveAttribute("href", "/dich-vu#tu-van-phong-lab");
  });
  ```

- [ ] **Step 2: Run the focused tests and confirm the expected red failure.**

  Run: `npm test -- next.config.test.ts src/lib/i18n.test.ts src/app/seo-routes.test.ts 'src/app/khoa-hoc/[slug]/page.test.tsx'`

  Expected: FAIL because `nextConfig.redirects` is undefined, legacy sitemap entries remain, and the quote-only CTA still targets `/giai-phap`.

- [ ] **Step 3: Implement redirects and remove retired route modules.**

  Add this `redirects` function to the exported `nextConfig` object in `next.config.ts`, beside the existing `rewrites` function:

  ```ts
  async redirects() {
    return [
      {
        source: "/giai-phap",
        destination: "/dich-vu",
        permanent: true,
      },
      {
        source: "/en/solutions",
        destination: "/en/services",
        permanent: true,
      },
    ];
  },
  ```

  Delete `src/app/giai-phap/page.tsx` and `src/app/en/solutions/page.tsx`. Next checks config redirects before filesystem routes, so permanent redirects handle all requests to both retired paths.

- [ ] **Step 4: Point all route maps, sitemap entries, and CTAs at the canonical paths.**

  Remove `["/giai-phap", "/en/solutions"]` from `routePairs` in `src/lib/i18n.ts`; retain `["/dich-vu", "/en/services"]`.

  Remove `["/giai-phap", "/en/solutions", 0.9]` from `staticRoutePairs` in `src/app/sitemap.ts`, then change the canonical pair to priority `0.9`:

  ```ts
  ["/dich-vu", "/en/services", 0.9],
  ```

  In `src/app/khoa-hoc/[slug]/page.tsx`, replace the legacy base with the canonical base:

  ```ts
  const solutionsHref = locale === "vi" ? "/dich-vu" : "/en/services";
  ```

  Keep the `#tu-van-phong-lab` fragment unchanged because it remains a service-consulting anchor referenced by the course CTA.

- [ ] **Step 5: Run the focused tests and confirm they turn green.**

  Run: `npm test -- next.config.test.ts src/lib/i18n.test.ts src/app/seo-routes.test.ts 'src/app/khoa-hoc/[slug]/page.test.tsx'`

  Expected: PASS; config declares two permanent redirects, locale switching retains the canonical destination, the sitemap excludes retired paths, and the quote-only course CTA targets `/dich-vu`.

- [ ] **Step 6: Commit route cleanup.**

  ```bash
  git add next.config.ts next.config.test.ts src/lib/i18n.ts src/lib/i18n.test.ts src/app/sitemap.ts src/app/seo-routes.test.ts 'src/app/khoa-hoc/[slug]/page.tsx' 'src/app/khoa-hoc/[slug]/page.test.tsx'
  git rm src/app/giai-phap/page.tsx src/app/en/solutions/page.tsx
  git commit -m "feat: redirect legacy solution routes"
  ```

## Task 4: Verify the complete frontend and preserve the Store carousel

**Files:**
- Modify only if verification exposes a direct regression in a file listed above.

**Interfaces:**
- Consumes: all production and test changes from Tasks 1–3.
- Produces: a clean, verified frontend build with homepage/static hero behavior and Store carousel behavior both covered.

- [ ] **Step 1: Run the full frontend test suite.**

  Run: `npm test`

  Expected: all Vitest files pass, including the unchanged `src/components/drone-hero-carousel.test.tsx` and `src/app/cua-hang/page.test.tsx`, proving that the Store still renders `drone-hero-carousel hero-carousel--compact`.

- [ ] **Step 2: Run the production build.**

  Run: `npm run build`

  Expected: `next build` exits 0 and reports an optimized production build without route or type errors.

- [ ] **Step 3: Inspect staging and commit only this feature's files.**

  Run:

  ```bash
  git diff --check
  git status --short
  git diff -- src/app/page.tsx src/app/dich-vu/page.tsx src/app/en/services/page.tsx next.config.ts
  ```

  Expected: no whitespace errors; `.key` remains untracked and unstaged; no `.superpowers/` path is staged.

- [ ] **Step 4: Commit any verification-only correction as a separate commit.**

  If verification required a correction, stage the specific corrected files from Tasks 1–3 and commit with `git commit -m "fix: verify homepage and solution routes"`. If the two verification commands pass without a correction, do not create an empty commit.
