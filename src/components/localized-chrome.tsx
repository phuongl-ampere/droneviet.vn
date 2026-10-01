"use client";

import { usePathname } from "next/navigation";
import { I18nProvider } from "@/components/i18n-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreHeader } from "@/components/store/store-header";
import type { Locale } from "@/lib/content";
import type { SiteContent } from "@/lib/content/schema";
import {
  getAlternateLocaleHref,
  getLanguageSwitchLabel,
  getLocaleFromPathname,
} from "@/lib/i18n";

type LocalizedChromeProps = {
  children: React.ReactNode;
  content: Record<Locale, SiteContent>;
};

export function LocalizedChrome({ children, content }: LocalizedChromeProps) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const site = content[locale];
  const alternateHref = getAlternateLocaleHref(pathname, locale);
  const isAdminRoute = pathname.startsWith("/admin");
  const isCommerceRoute =
    pathname.startsWith("/cua-hang") ||
    pathname.startsWith("/gio-hang") ||
    pathname.startsWith("/khoa-hoc") ||
    pathname.startsWith("/san-pham") ||
    pathname.startsWith("/en/products") ||
    pathname.startsWith("/en/store") ||
    pathname.startsWith("/en/cart") ||
    pathname.startsWith("/en/checkout") ||
    pathname.startsWith("/en/order-tracking") ||
    pathname.startsWith("/en/quote") ||
    pathname.startsWith("/en/courses") ||
    pathname.startsWith("/bao-gia") ||
    pathname.startsWith("/thanh-toan") ||
    pathname.startsWith("/theo-doi-don") ||
    pathname.startsWith("/tai-khoan");

  if (isAdminRoute) {
    return (
      <I18nProvider locale={locale}>
        <main className="flex-1">{children}</main>
      </I18nProvider>
    );
  }

  if (isCommerceRoute) {
    return (
      <I18nProvider locale={locale}>
        <StoreHeader
          locale={locale}
          alternateHref={alternateHref}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter
          brandName={site.brand.name}
          tagline={site.brand.description}
          navigation={site.navigation}
          locale={locale}
        />
      </I18nProvider>
    );
  }

  return (
    <I18nProvider locale={locale}>
      <SiteHeader
        brandName={site.brand.name}
        navigation={site.navigation}
        primaryCta={site.hero.primaryCta}
        homeHref={locale === "vi" ? "/" : "/en"}
        locale={locale}
        languageSwitch={{
          href: alternateHref,
          label: getLanguageSwitchLabel(locale),
        }}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        brandName={site.brand.name}
        tagline={site.brand.description}
        navigation={site.navigation}
        locale={locale}
      />
    </I18nProvider>
  );
}
