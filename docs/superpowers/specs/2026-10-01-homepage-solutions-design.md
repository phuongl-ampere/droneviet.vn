# Homepage and Solutions Navigation Design

## Goal

Simplify the Vietnamese and English public site: the homepage uses one static image-led hero instead of the animated carousel and 3D-style drone artwork, while the former Services destination becomes the single All Solutions destination.

## Homepage

- Replace only the homepage use of `DroneHeroCarousel` with a static hero using the existing drone photography.
- Use the approved image-led layout: a single full-width image with a short eyebrow and headline. The image remains the visual focus; no slider controls, autoplay, or secondary visual treatment is added.
- Remove the homepage's decorative `DroneMark` artwork so the page contains no 3D or simulated-3D drone presentation.
- Keep the Store page's compact `DroneHeroCarousel` unchanged.
- Keep the current homepage sections after the hero, retaining the existing responsive and accessibility patterns.

## Information architecture

- Rename the Vietnamese navigation label from Dịch vụ to Tất cả giải pháp and the English equivalent from Services to All solutions.
- Reuse `/dich-vu` and `/en/services` as the canonical routes. They display all solution cards and use solution-specific titles, descriptions, metadata, and structured content.
- Remove the standalone `/giai-phap` and `/en/solutions` pages. Configure permanent redirects from these legacy routes to the canonical Services routes so old links and indexed addresses remain valid.
- Update header, footer, sitemap, language switching, and every internal link that still targets a legacy Solutions route.

## Content and implementation boundaries

- Preserve the existing solutions data and card component; move its presentation to the canonical Services routes rather than duplicating content.
- Keep routes, product detail links, and course calls-to-action aligned with the new canonical destination.
- Do not change the Store carousel, checkout, customer accounts, or unrelated page layouts.

## Testing and verification

- Update homepage tests to assert the static hero and the absence of carousel controls and decorative drone artwork.
- Update route and chrome tests for the renamed navigation and canonical solution links.
- Verify redirects, sitemap entries, locale equivalents, frontend unit tests, frontend production build, backend tests, and backend production build.
