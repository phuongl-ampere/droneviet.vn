"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { CustomerAccountMenu } from "@/components/customer/customer-account-menu";
import { getDronePillars } from "@/lib/drone-pillars";
import { LocaleToggle } from "@/components/locale-toggle";
import { getTranslation, type TranslationKey } from "@/lib/i18n";

type LinkItem = {
  label: string;
  href: string;
};

type SiteHeaderProps = {
  brandName: string;
  navigation: LinkItem[];
  primaryCta: LinkItem;
  homeHref?: string;
  locale?: "vi" | "en";
  languageSwitch?: LinkItem;
};

export function SiteHeader({
  brandName,
  primaryCta,
  homeHref = "/",
  locale = "vi",
  languageSwitch,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const primaryCtaIsExternal = primaryCta.href.startsWith("http");
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const pillars = getDronePillars(locale);
  const storePillar = pillars.find((pillar) => pillar.slug === "cua-hang");
  const navigationPillars = pillars.filter(
    (pillar) => pillar.slug !== "cua-hang",
  );
  const navigationLabel = t("header.mainNavigation");
  const mobileNavigationLabel = t("header.mobileNavigation");
  const loginHref = locale === "vi" ? "/dang-nhap" : "/en/login";
  const accountHref = locale === "vi" ? "/tai-khoan" : "/en/account";

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#071117]/94 text-white backdrop-blur-2xl">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:gap-5 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-1 sm:gap-3.5 lg:justify-self-start">
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen ? t("header.closeMenu") : t("header.openMenu")
            }
            title={
              mobileMenuOpen ? t("header.closeMenu") : t("header.openMenu")
            }
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="grid size-9 shrink-0 place-items-center lg:hidden hover:bg-white/10"
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" size={18} />
            ) : (
              <Menu aria-hidden="true" size={18} />
            )}
          </button>
          <Link
            href={homeHref}
            className="group flex min-w-0 items-center gap-2 sm:gap-3.5"
            aria-label={brandName}
          >
            <span className="relative size-10 shrink-0">
              <Image
                alt=""
                data-testid="site-brand-logo"
                fill
                priority
                sizes="40px"
                src="/logo.png"
                className="object-contain"
              />
            </span>
            <span className="hidden sm:block">
              <span className="block text-[15px] font-semibold tracking-[-0.01em]">
                {brandName}
              </span>
              <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:block">
                {t("header.researchEducation")}
              </span>
            </span>
          </Link>
        </div>

        <nav
          className="hidden items-center gap-5 lg:justify-self-center lg:flex"
          aria-label={navigationLabel}
        >
          {navigationPillars.map((pillar) => (
            <div key={pillar.slug} className="group relative">
              <button
                type="button"
                aria-haspopup="true"
                className="relative block py-3 text-[13px] font-medium text-slate-300 transition hover:text-white focus:text-white"
              >
                {pillar.title}
                <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-[#00D1C1] transition-transform duration-300 group-hover:scale-x-100 group-focus-within:scale-x-100" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 w-80 border border-white/12 bg-[#10232A] p-4 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="grid">
                  {pillar.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="py-2 text-sm text-slate-200 transition hover:text-[#7DE0D7]"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {storePillar ? (
            <div
              data-testid="site-store-dropdown"
              className="group relative"
            >
              <Link
                href={storePillar.href}
                className="block rounded-full border border-white px-2 py-1 text-[12px] font-medium text-white transition hover:bg-white/10 focus:bg-white/10"
              >
                {storePillar.title}
              </Link>
              <div className="invisible absolute right-0 top-full z-50 w-64 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="border border-white/12 bg-[#10232A] p-3 shadow-2xl">
                  {storePillar.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="block py-2 text-sm text-slate-200 transition hover:text-[#7DE0D7]"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:justify-self-end">
          {languageSwitch ? (
            <LocaleToggle locale={locale} alternateHref={languageSwitch.href} />
          ) : null}
          <CustomerAccountMenu
            accountHref={accountHref}
            loginHref={loginHref}
            visitorClassName="inline-flex min-h-8 items-center px-2 text-[12px] font-medium text-slate-300 transition hover:text-white focus:text-white"
          />
          <Link
            href={primaryCta.href}
            aria-label={primaryCta.label}
            target={primaryCtaIsExternal ? "_blank" : undefined}
            rel={primaryCtaIsExternal ? "noopener noreferrer" : undefined}
            className="inline-flex min-h-8 items-center justify-center gap-1 rounded-full bg-white px-2.5 text-[11px] font-semibold text-[#10232A] transition hover:bg-[#00D1C1] sm:px-3"
          >
            <span
              aria-hidden="true"
              data-testid="consultation-zalo-badge"
              className="consultation-zalo-badge relative grid size-4 shrink-0 place-items-center rounded-full bg-[#0068FF]"
            >
              <Image
                alt=""
                data-testid="consultation-zalo-icon"
                height={10}
                src="/zalo-icon.svg"
                width={10}
                className="relative z-10 size-2.5"
              />
            </span>
            <span className="hidden sm:inline">{primaryCta.label}</span>
            <span aria-hidden="true" className="sm:hidden">
              {locale === "en" ? t("common.contact") : t("header.consultation")}
            </span>
          </Link>
        </div>
      </div>
      {mobileMenuOpen ? (
        <nav
          className="mx-auto grid w-full max-w-7xl justify-items-center gap-3 border-t border-white/8 px-5 py-3 text-center lg:hidden"
          aria-label={mobileNavigationLabel}
        >
          {pillars.map((pillar) => (
            <details
              key={pillar.slug}
              className="w-full border-b border-white/8 pb-2 text-center text-xs text-slate-300"
            >
              <summary className="cursor-pointer py-1.5 font-medium">
                {pillar.title}
              </summary>
              <div className="grid gap-2 py-2 pl-3">
                {pillar.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-400 hover:text-[#7DE0D7]"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
