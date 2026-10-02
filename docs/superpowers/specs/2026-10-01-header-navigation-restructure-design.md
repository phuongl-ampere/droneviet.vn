# Header Navigation Restructure Design

## Goal

Make the Vietnamese header navigation less crowded by reducing it from six to five top-level pillars and rendering a single, polished top row on desktop. Preserve the three useful event-related destinations under their natural content groups.

## Navigation structure

- Remove the `Dịch vụ & Sự kiện` pillar and all of its route data.
- Add `Event/trải nghiệm drone` to `Đào tạo & Chứng chỉ` at `/dao-tao-chung-chi/event-trai-nghiem`.
- Add `Workshop trường học` to `Drone Giáo Dục` at `/drone-giao-duc/workshop-truong-hoc`.
- Add `Tin tức drone` to `Kiến thức & R&D` at `/kien-thuc-rd/tin-tuc-drone`.
- Remove `Demo lab` and `Tư vấn triển khai`; they have no replacement destination.
- The retired `/dich-vu-su-kien/*` paths have no redirects and resolve to 404.

## Header behavior

- Keep the existing five visible Vietnamese top-level pillars: Đào tạo & Chứng chỉ, Drone Giáo Dục, Cửa hàng, Bay Hợp Pháp, and Kiến thức & R&D.
- Apply fog / navy / coral only to the header: `#eef1f2` for a subtle muted surface, `#253957` for the fixed header and primary elements, `#ff775c` for focus and active accents, and `9px` radii on menu surfaces.
- At widths of 980px and above, render exactly one fixed header row: brand at the left, all five desktop destinations in the center, and account, locale, and consultation actions at the right.
- Keep desktop dropdown navigation sourced from `dronePillars`; the Store remains a direct link.
- Below 980px, keep the header itself to one row and expose the same shared navigation only after a hamburger button is pressed. The menu closes after a destination is selected.
- Retain the existing typography, authentication, administration, locale, and consultation behavior outside the header layout change.

## Validation

- Header tests assert five Vietnamese pillars, the three relocated entries and their new URLs, the absence of the retired group and removed entries, and the closed/open mobile-menu state.
- Dynamic topic route tests assert the new destinations render and retired event paths return `notFound`.
- Existing homepage and localized chrome tests continue to consume the shared pillar data without regressions.
