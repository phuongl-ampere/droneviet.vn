# Store Catalog-First Design

## Goal

Make the Store page reach the product catalog immediately by removing its visible promotional introduction.

## Layout

- Remove the visible section containing `Drone Viet Store`, `Cửa hàng Drone Việt`, and its descriptive paragraph.
- Keep a visually hidden H1 named `Cửa hàng Drone Việt` for document structure and accessibility.
- Start the catalog directly below the shared Store header with existing item count, filter controls, desktop availability sidebar, and product grid.
- Reduce the catalog section top spacing to make products available sooner without changing filters, product cards, query behavior, or the image-attribution footer.

## Validation

- Store page tests assert the H1 remains accessible but the promotional label and description are not visible.
- Existing product, availability filter, and product-link assertions remain unchanged.
- Run focused Store tests and the frontend production build.
