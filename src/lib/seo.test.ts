import { describe, expect, it } from "vitest";
import { getDroneModels, getServices, getSiteContent } from "@/lib/content";
import {
  buildAbsoluteUrl,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildServiceJsonLd,
  getLocalizedAlternates,
  siteUrl,
} from "./seo";

describe("seo helpers", () => {
  it("builds canonical urls and localized alternates", () => {
    expect(siteUrl).toBe("https://droneviet.vn");
    expect(buildAbsoluteUrl("/san-pham/dv-primary-lab")).toBe(
      "https://droneviet.vn/san-pham/dv-primary-lab",
    );
    expect(getLocalizedAlternates("/san-pham/dv-primary-lab", "/en/products/dv-primary-lab")).toEqual({
      vi: "https://droneviet.vn/san-pham/dv-primary-lab",
      en: "https://droneviet.vn/en/products/dv-primary-lab",
      "x-default": "https://droneviet.vn/san-pham/dv-primary-lab",
    });
  });

  it("builds structured data for organization, product, service, and breadcrumbs", () => {
    const site = getSiteContent("vi");
    const drone = getDroneModels("vi")[0];
    const service = getServices("vi")[0];

    expect(buildOrganizationJsonLd(site)).toMatchObject({
      "@type": "EducationalOrganization",
      name: "Drone Việt",
      url: "https://droneviet.vn",
    });
    expect(buildProductJsonLd(drone, "vi")).toMatchObject({
      "@type": "Product",
      name: "DV Primary Lab",
      category: "Drone research and education kit",
    });
    expect(buildServiceJsonLd(service, "vi")).toMatchObject({
      "@type": "Service",
      name: "Tư vấn phòng lab drone nghiên cứu & giáo dục",
      provider: {
        name: "Drone Việt",
      },
    });
    const breadcrumbs = buildBreadcrumbJsonLd([
      { name: "Trang chủ", url: "/" },
      { name: "Sản phẩm", url: "/san-pham" },
    ]);

    expect(breadcrumbs).toMatchObject({ "@type": "BreadcrumbList" });
    expect(breadcrumbs.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Trang chủ",
      item: "https://droneviet.vn/",
    });
    expect(breadcrumbs.itemListElement[1]).toMatchObject({
      position: 2,
      name: "Sản phẩm",
      item: "https://droneviet.vn/san-pham",
    });
  });
});
