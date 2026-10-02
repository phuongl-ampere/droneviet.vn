# Homepage Hero-Only Design

## Goal

Make the homepage a focused landing screen by retaining the existing hero carousel and removing every content section beneath it.

## Scope

- Keep `DroneHeroCarousel` exactly as it is: three images, automatic rotation, manual controls, localized headline, description, and calls to action.
- Keep the shared fixed header and footer supplied by the application chrome.
- Remove the homepage pillars, featured solution cards, services, and deployment-process sections.
- Remove homepage-only helpers and data reads that become unused after those sections are gone.
- Do not change Store, product, curriculum, content, or other route layouts.

## Validation

- Homepage tests assert the existing hero carousel remains present and interactive.
- Homepage tests assert no pillar, featured-solution, service, or process heading renders below the hero.
- Run the frontend test suite and production build.
