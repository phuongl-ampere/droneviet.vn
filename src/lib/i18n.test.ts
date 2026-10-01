import { describe, expect, it } from "vitest";
import {
  getAlternateLocaleHref,
  getLanguageSwitchLabel,
  getLocaleFromPathname,
} from "./i18n";

describe("i18n routing", () => {
  it("detects locale and maps route pairs", () => {
    expect(getLocaleFromPathname("/")).toBe("vi");
    expect(getLocaleFromPathname("/en/products")).toBe("en");
    expect(getAlternateLocaleHref("/san-pham", "vi")).toBe("/en/products");
    expect(getAlternateLocaleHref("/en/news/drone-stem-research", "en")).toBe(
      "/tin-tuc/drone-giao-duc-stem",
    );
    expect(getAlternateLocaleHref("/san-pham/dv-primary-lab", "vi")).toBe(
      "/en/products/dv-primary-lab",
    );
    expect(getAlternateLocaleHref("/en/products/dv-ai-vision", "en")).toBe(
      "/san-pham/dv-ai-vision",
    );
    expect(getLanguageSwitchLabel("vi")).toBe("EN");
    expect(getLanguageSwitchLabel("en")).toBe("VI");
  });
});
