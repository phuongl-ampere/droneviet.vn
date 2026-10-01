import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getAlternateLocaleHref,
  getTranslation,
  getTranslations,
  translate,
} from "@/lib/i18n";
import en from "@/i18n/locales/en.json";
import vi from "@/i18n/locales/vi.json";

function leafKeys(
  value: unknown,
  prefix = "",
): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value)
    .flatMap(([key, nested]) => leafKeys(nested, `${prefix}${prefix ? "." : ""}${key}`))
    .sort();
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return sourceFiles(path);
    }

    return /\.(ts|tsx)$/.test(entry.name) && !entry.name.includes(".test.")
      ? [path]
      : [];
  });
}

describe("i18n dictionaries", () => {
  it("returns the requested Vietnamese and English copy from the two dictionaries", () => {
    expect(getTranslation("vi", "store.search")).toBe("Tìm kiếm");
    expect(getTranslation("en", "store.search")).toBe("Search");
    expect(getTranslations("vi").common.brandName).toBe("Drone Việt");
  });

  it("interpolates named values in translated copy", () => {
    expect(
      translate("en", "store.cartItemCount", { count: "3" }),
    ).toBe("Cart (3)");
  });

  it("keeps Vietnamese and English dictionaries structurally aligned", () => {
    expect(leafKeys(en)).toEqual(leafKeys(vi));
  });

  it("keeps the storefront destination when switching languages", () => {
    expect(getAlternateLocaleHref("/cua-hang", "vi")).toBe("/en/store");
    expect(getAlternateLocaleHref("/en/store", "en")).toBe("/cua-hang");
  });

  it("switches between the canonical solution pages", () => {
    expect(getAlternateLocaleHref("/dich-vu", "vi")).toBe("/en/services");
    expect(getAlternateLocaleHref("/en/services", "en")).toBe("/dich-vu");
  });

  it("stores public site and article content in the locale dictionaries", () => {
    expect(getTranslations("vi").content.site.hero.title).toBe(
      "Giải pháp drone cho giáo dục và nghiên cứu",
    );
    expect(getTranslations("en").articles[0].title).toBe(
      "Drones in STEM classrooms and applied research",
    );
  });

  it("keeps locale content out of runtime source files", () => {
    const root = process.cwd();
    const runtimeFiles = ["src/app", "src/components", "src/lib"].flatMap(
      (directory) => sourceFiles(join(root, directory)),
    );
    const filesWithLocalizedLiterals = runtimeFiles.filter((file) =>
      [...readFileSync(file, "utf8")].some(
        (character) =>
          character.charCodeAt(0) > 127 && /\p{L}/u.test(character),
      ),
    );

    expect(filesWithLocalizedLiterals).toEqual([]);
    expect(existsSync(join(root, "src/content/data/site.ts"))).toBe(false);
    expect(existsSync(join(root, "src/content/data/articles.ts"))).toBe(false);
  });
});
