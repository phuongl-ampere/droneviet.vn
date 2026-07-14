"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
