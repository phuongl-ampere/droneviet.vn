# Drone Việt Premium Aerospace Interface Design

**Date:** 2026-07-14

**Status:** Approved design direction, pending written-spec review

## Objective

Redesign the complete Vietnamese and English public website so it feels like a mature premium aerospace and education brand rather than a coding dashboard. Preserve the existing interactive 3D drone lab as the site's primary signature and improve its visual finish. Keep the existing information architecture, content model, routes, SEO behavior, and Zalo conversion path.

The redesign must communicate three qualities: credible enough for universities and research labs, clear enough for schools and STEM centers, and visually distinctive enough to make the drone product memorable.

## Visual Direction

The experience is split deliberately into two atmospheres. The homepage hero remains a dark, cinematic drone laboratory. Everything after it moves into a quiet editorial catalog with warm-neutral surfaces, confident typography, generous spacing, and restrained technical detail. Neon and glow belong almost exclusively to the 3D environment; they do not become the default treatment for cards, headings, or navigation.

### Design tokens

- Flight night: `#071117` for the 3D hero and footer.
- Deep airframe: `#10232A` for dark text and concentrated brand surfaces.
- Field paper: `#F5F7F4` for the primary page background.
- Carbon ink: `#172226` for headings and body copy.
- Flight teal: `#00A99B` for links, controls, focus states, and selected product details.
- Signal brass: `#D69C54` for small curriculum and process accents only.

The current bright `#00D1C1` remains available inside the 3D scene, where emitted light is contextually appropriate. Outside the scene, the quieter Flight teal is used to prevent a neon dashboard effect.

### Typography

- `Newsreader` is the display face for homepage statements, page titles, product names, and editorial article titles. It supplies a human, research-oriented voice without turning the site into a luxury-fashion layout.
- `Manrope` is the body and interface face for navigation, descriptions, buttons, specifications, and labels.
- Monospace text is removed from decorative labels. Data-like values may use tabular numerals through Manrope rather than a code font.
- Both fonts load through `next/font/google` with Vietnamese support and CSS variables.

### Shape and spacing

Most card radii move from repeated compact rounded boxes to a restrained 16–24 px system. Content sections use larger vertical intervals and fewer standalone boxes. Fine rules, aligned baselines, tonal surfaces, and whitespace create hierarchy. Shadows are broad and subtle; glow is reserved for the hero.

## Signature Experience: 3D Drone Lab

The existing React Three Fiber lab, five drone stations, scroll-driven camera movement, pointer parallax, and reduced-motion support remain. This is the memorable element of the site and is not replaced with a static hero.

The update will:

- improve the room lighting and material balance so drones read as products rather than game objects;
- simplify the copy overlay and increase typographic contrast;
- restyle the active-drone panel as a premium product placard instead of telemetry/HUD;
- replace developer-facing labels such as “Active station” with localized customer-facing copy;
- preserve the full-screen cinematic reveal while smoothing the transition into the light catalog below;
- keep the test-only fallback so unit tests do not require WebGL;
- retain keyboard-accessible CTA links and reduced-motion behavior.

A thin, restrained flight-path curve begins at the lower edge of this hero and reappears only where it clarifies progression, such as the three-step deployment section. It is the site's supporting visual signature, not a repeating decoration.

## Shared Site Chrome

The header remains dark over the dark hero and uses a compact airframe-inspired brand mark, calm navigation spacing, a clearly dominant consultation CTA, and an accessible language switch. The mobile navigation remains usable without turning into a row of dashboard pills.

The footer becomes an institutional close: concise positioning, route groups, and the consultation path. Technical filler labels are removed. Both header and footer must render the correct locale, including link destinations and accessible labels.

## Homepage

After the 3D hero, the homepage uses an editorial rhythm rather than a sequence of equal card grids:

1. A featured solution introduction shows the four priority drones in a spacious two-column catalog composition, with one leading product receiving stronger visual weight.
2. A dark-but-not-neon service band explains deployment capabilities in three concise pillars.
3. The existing three-step deployment sequence uses real sequential numbering and the flight-path motif because order is meaningful.
4. Calls to action stay focused on product discovery and Zalo consultation; no additional conversion flows are introduced.

Hard-coded Vietnamese section copy in the shared homepage component must be localized so the English homepage is fully English.

## Listing Pages and Cards

Products, solutions, curriculum, services, and news share a new page-intro treatment: editorial headline, concise explanation, and a restrained supporting rule or label. The pages keep their existing route structure and data loaders.

- Drone cards become product catalog tiles with a larger visual field, fewer icons, clearer audience and specification hierarchy, and an obvious detail link.
- Curriculum cards emphasize learning level, delivery format, modules, and readiness without looking like status widgets.
- Service cards use capability-led copy and deliverables instead of tool icons and translucent dashboard panels.
- News cards use an editorial article layout with date, category, title, and summary.
- English curriculum and service card CTAs must link to English routes. Shared components will accept localized route bases or complete CTA destinations rather than hard-coding Vietnamese paths.

## Product Detail and Article Pages

Product detail opens with a media-led product hero, a strong product statement, use-case context, and the primary consultation action. Specifications move into a calm structured table. Outcomes, related services, and FAQs use distinct sections rather than many equally weighted cards. Existing Product, Service, FAQ, and Breadcrumb JSON-LD remain intact.

Article detail adopts readable editorial measure, display typography, and clearer metadata. Markdown-backed content behavior is unchanged in this redesign.

## Component Architecture

The existing content schemas and loader APIs remain the source of truth. Presentation changes are organized around focused reusable components:

- global tokens and type variables in `src/app/globals.css` and `src/app/layout.tsx`;
- shared navigation in `SiteHeader`, `SiteFooter`, and `LocalizedChrome`;
- common page introductions and section spacing in `SectionShell` or a small dedicated page-intro component;
- content-specific cards for drones, curriculum, services, and articles;
- the 3D scene and its overlay remain contained within `DroneLabShowroom`;
- product-detail content remains driven by the existing `DroneModel` and `Service` structures.

No CMS, database, filtering system, animation library, or new product-data field is introduced. The redesign uses the current React, Tailwind, Three.js, Lucide, Zod, and Next.js stack.

## Responsive and Accessibility Requirements

- Layouts must work at 360 px mobile width through wide desktop screens.
- Focus states must be visible against both light and dark surfaces.
- Body text maintains readable contrast and comfortable line length.
- Touch targets remain at least 44 px high.
- The 3D experience respects `prefers-reduced-motion`; content remains available through the non-canvas overlay.
- Decorative flight-path elements are hidden from assistive technology.
- External Zalo links retain safe target and relationship attributes.

## Failure and Fallback Behavior

The current test fallback for the WebGL hero remains. If reduced motion is requested, camera travel and pointer parallax stop while the selected drone and CTA content remain visible. Missing dynamic product or article slugs continue to use Next.js `notFound()`. No new client-side data fetching or runtime error state is required.

## Testing and Acceptance

Implementation follows test-first cycles for observable UI behavior. Tests will cover localized homepage copy, localized card destinations, presence of the premium hero product placard, route rendering, CTA behavior, and existing SEO output. Existing content, route, product detail, i18n, sitemap, robots, JSON-LD, and `llms.txt` tests must remain green.

Final verification requires:

- `npm test` passes;
- `npm run lint` passes;
- `npm run build` passes;
- desktop and mobile screenshots are inspected for the homepage, a listing page, and a product-detail page in both relevant layout modes;
- no unintended horizontal overflow, illegible overlay copy, or broken language navigation is present.

## Out of Scope

- Replacing or removing the 3D hero.
- Adding a CMS, database, checkout, lead form, search, filtering, or authentication.
- Producing photographic assets or changing the product catalog content.
- Restructuring URLs or changing the Zalo consultation destination.
- Rewriting the Markdown/content ingestion system.
