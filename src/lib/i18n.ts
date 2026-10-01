import type { Locale } from "@/lib/content";
import en from "@/i18n/locales/en.json";
import vi from "@/i18n/locales/vi.json";

const routePairs = [
  ["/", "/en"],
  ["/san-pham", "/en/products"],
  ["/giao-trinh", "/en/curriculum"],
  ["/dich-vu", "/en/services"],
  ["/tin-tuc", "/en/news"],
  ["/cua-hang", "/en/store"],
  ["/gio-hang", "/en/cart"],
  ["/thanh-toan", "/en/checkout"],
  ["/thanh-toan/ket-qua", "/en/checkout/result"],
  ["/theo-doi-don", "/en/order-tracking"],
  ["/bao-gia", "/en/quote"],
  ["/khoa-hoc", "/en/courses"],
  ["/dang-nhap", "/en/login"],
  ["/dang-ky", "/en/register"],
  ["/tai-khoan", "/en/account"],
  ["/tin-tuc/drone-giao-duc-stem", "/en/news/drone-stem-research"],
  ["/tin-tuc/giao-trinh-drone-theo-cap-hoc", "/en/news/drone-curriculum-levels"],
] as const;

const viToEn = new Map<string, string>(routePairs);
const enToVi = new Map<string, string>(routePairs.map(([vi, en]) => [en, vi]));

const dictionaries = { en, vi } as const;

type Dictionary = typeof vi;
type DictionaryValue =
  | boolean
  | null
  | number
  | string
  | DictionaryValue[]
  | { [key: string]: DictionaryValue };

type NestedTranslationKey<T> = T extends readonly unknown[]
  ? never
  : {
      [Key in keyof T & string]: T[Key] extends string
        ? Key
        : T[Key] extends object
          ? `${Key}.${NestedTranslationKey<T[Key]>}`
          : never;
    }[keyof T & string];

export type TranslationKey = NestedTranslationKey<Dictionary>;

function resolveTranslation(dictionary: DictionaryValue, key: string): string {
  const value = key.split(".").reduce<DictionaryValue | undefined>(
    (current, part) =>
      current && typeof current === "object" && !Array.isArray(current)
        ? current[part]
        : undefined,
    dictionary,
  );

  if (typeof value !== "string") {
    throw new Error(`Missing translation for "${key}".`);
  }

  return value;
}

export function getTranslations(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return resolveTranslation(getTranslations(locale), key);
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  variables?: Record<string, string | number>,
): string {
  let value = getTranslation(locale, key);

  for (const [name, replacement] of Object.entries(variables ?? {})) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }

  return value;
}

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "vi";
}

export function getAlternateLocaleHref(pathname: string, locale: Locale): string {
  if (locale === "vi" && pathname.startsWith("/san-pham/")) {
    return pathname.replace("/san-pham/", "/en/products/");
  }

  if (locale === "en" && pathname.startsWith("/en/products/")) {
    return pathname.replace("/en/products/", "/san-pham/");
  }

  if (locale === "vi" && pathname.startsWith("/khoa-hoc/")) {
    return pathname.replace("/khoa-hoc/", "/en/courses/");
  }

  if (locale === "en" && pathname.startsWith("/en/courses/")) {
    return pathname.replace("/en/courses/", "/khoa-hoc/");
  }

  return locale === "vi" ? viToEn.get(pathname) ?? "/en" : enToVi.get(pathname) ?? "/";
}

export function getLanguageSwitchLabel(locale: Locale): string {
  return getTranslation(
    locale,
    locale === "vi" ? "locale.englishCode" : "locale.vietnameseCode",
  );
}
