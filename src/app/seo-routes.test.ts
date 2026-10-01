import { describe, expect, it } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

describe("seo route metadata", () => {
  it("generates robots rules and sitemap url", () => {
    expect(robots()).toMatchObject({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://droneviet.vn/sitemap.xml",
      host: "https://droneviet.vn",
    });
  });

  it("generates localized sitemap entries for static and detail pages", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://droneviet.vn/");
    expect(urls).toContain("https://droneviet.vn/en");
    expect(urls).toContain("https://droneviet.vn/san-pham/dv-primary-lab");
    expect(urls).toContain("https://droneviet.vn/en/products/dv-primary-lab");
    expect(urls).toContain("https://droneviet.vn/tin-tuc/drone-giao-duc-stem");
    expect(urls).toContain("https://droneviet.vn/en/news/drone-stem-research");
    expect(entries.find((entry) => entry.url === "https://droneviet.vn/")?.alternates?.languages).toMatchObject({
      en: "https://droneviet.vn/en",
      vi: "https://droneviet.vn/",
    });
  });
});

