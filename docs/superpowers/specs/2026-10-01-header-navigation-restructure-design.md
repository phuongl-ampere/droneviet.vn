# Header Navigation Restructure Design

## Goal

Make the Vietnamese header navigation less crowded by reducing it from six to five top-level pillars, while preserving the three useful event-related destinations under their natural content groups.

## Navigation structure

- Remove the `Dịch vụ & Sự kiện` pillar and all of its route data.
- Add `Event/trải nghiệm drone` to `Đào tạo & Chứng chỉ` at `/dao-tao-chung-chi/event-trai-nghiem`.
- Add `Workshop trường học` to `Drone Giáo Dục` at `/drone-giao-duc/workshop-truong-hoc`.
- Add `Tin tức drone` to `Kiến thức & R&D` at `/kien-thuc-rd/tin-tuc-drone`.
- Remove `Demo lab` and `Tư vấn triển khai`; they have no replacement destination.
- The retired `/dich-vu-su-kien/*` paths have no redirects and resolve to 404.

## Header behavior

- Keep the existing five visible Vietnamese top-level pillars: Đào tạo & Chứng chỉ, Drone Giáo Dục, Cửa hàng, Bay Hợp Pháp, and Kiến thức & R&D.
- Preserve desktop dropdown navigation and mobile disclosure navigation, sourced from the same `dronePillars` data.
- Tighten desktop navigation spacing and header-side controls so the five pillars remain on one deliberate row without visual crowding at desktop widths.
- Keep the Store as a direct link and retain all existing authentication, admin, locale, and consultation actions.

## Validation

- Header tests assert five Vietnamese pillars, the three relocated entries and their new URLs, and the absence of the retired group and removed entries.
- Dynamic topic route tests assert the new destinations render and retired event paths return `notFound`.
- Existing homepage and localized chrome tests continue to consume the shared pillar data without regressions.
