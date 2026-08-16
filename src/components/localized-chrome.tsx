"use client";

import { usePathname } from "next/navigation";
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
  const isAdminRoute = pathname.startsWith("/admin");
  const isCommerceRoute =
    pathname.startsWith("/cua-hang") ||
    pathname.startsWith("/gio-hang") ||
    pathname.startsWith("/khoa-hoc") ||
    pathname.startsWith("/san-pham") ||
    pathname.startsWith("/en/products") ||
    pathname.startsWith("/bao-gia") ||
    pathname.startsWith("/thanh-toan") ||
    pathname.startsWith("/theo-doi-don");

  if (isAdminRoute) {
    return <main className="flex-1">{children}</main>;
  }

  if (isCommerceRoute) {
    return (
      <>
        <StoreHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter
          brandName={site.brand.name}
          tagline={site.brand.description}
          navigation={site.navigation}
          locale={locale}
        />
      </>
    );
  }

  return (
    <>
      <SiteHeader
        brandName={site.brand.name}
        navigation={site.navigation}
        primaryCta={site.hero.primaryCta}
        homeHref={locale === "vi" ? "/" : "/en"}
        locale={locale}
        languageSwitch={{
          href: getAlternateLocaleHref(pathname, locale),
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
    </>
  );
}
