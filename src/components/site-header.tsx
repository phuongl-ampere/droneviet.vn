"use client";

import { useState } from "react";
import { ArrowUpRight, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import Link from "next/link";
import { dronePillars } from "@/lib/drone-pillars";

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
  navigation,
  primaryCta,
  homeHref = "/",
  locale = "vi",
  languageSwitch,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const primaryCtaIsExternal = primaryCta.href.startsWith("http");
  const navigationLabel = locale === "vi" ? "Điều hướng chính" : "Main navigation";
  const mobileNavigationLabel =
    locale === "vi" ? "Điều hướng trên điện thoại" : "Mobile navigation";
  const menuLabel = mobileMenuOpen
    ? locale === "vi"
      ? "Đóng menu"
      : "Close menu"
    : locale === "vi"
      ? "Mở menu"
      : "Open menu";

  return (
    <header className="sticky top-0 z-50 border-b border-[#253957]/12 bg-[#253957]/95 text-white backdrop-blur-2xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-4 min-[1120px]:gap-3 min-[1120px]:px-8">
        <Link
          href={homeHref}
          className="group flex shrink-0 items-center gap-3.5"
          aria-label={brandName}
        >
          <span className="relative grid size-9 place-items-center rounded-[9px] border border-white/20 bg-white/8 transition group-hover:-translate-y-px group-hover:border-[#ff775c]">
            <span className="h-px w-5 bg-[#ff775c]" />
            <span className="absolute h-5 w-px bg-[#ff775c]" />
            <span className="absolute size-2 rounded-full border border-[#ff775c] bg-[#253957]" />
          </span>
          <span>
            <span className="block text-[15px] font-semibold tracking-[-0.01em]">
              {brandName}
            </span>
            <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-[#eef1f2]/60 min-[1120px]:block">
              Research · Education
            </span>
          </span>
        </Link>

        <nav
          className="hidden shrink-0 items-center gap-2 min-[980px]:flex min-[1120px]:gap-4"
          aria-label={navigationLabel}
        >
          {locale === "vi"
            ? dronePillars.map((pillar, index) => (
                <div key={pillar.slug} className="group relative">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      data-testid="header-menu-divider"
                      className="pointer-events-none absolute -left-1.5 top-1/2 h-3 w-px -translate-y-1/2 bg-[#eef1f2]/35"
                    />
                  ) : null}
                  {pillar.slug === "cua-hang" ? (
                    <Link
                      href="/cua-hang"
                      className="relative block whitespace-nowrap py-3 text-[12px] font-medium text-[#eef1f2]/78 transition hover:text-white focus:text-white min-[1120px]:text-[13px]"
                    >
                      {pillar.title}
                      <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-[#ff775c] transition-transform duration-300 group-hover:scale-x-100 group-focus-within:scale-x-100" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      aria-haspopup="true"
                      className="relative block whitespace-nowrap py-3 text-[12px] font-medium text-[#eef1f2]/78 transition hover:text-white focus:text-white min-[1120px]:text-[13px]"
                    >
                      {pillar.title}
                      <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-[#ff775c] transition-transform duration-300 group-hover:scale-x-100 group-focus-within:scale-x-100" />
                    </button>
                  )}
                  <div className="invisible absolute left-0 top-full z-50 w-80 rounded-[9px] border border-[#253957]/15 bg-[#eef1f2] p-3 opacity-0 shadow-lg shadow-[#253957]/12 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="grid">
                      {pillar.items.map((item) => (
                        <Link
                          key={item.slug}
                          href={item.href}
                          className="rounded-[7px] px-3 py-2 text-sm text-[#253957] transition hover:bg-white hover:text-[#ff775c]"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            : navigation.map((item, index) => (
                <div key={item.href} className="relative">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      data-testid="header-menu-divider"
                      className="pointer-events-none absolute -left-1.5 top-1/2 h-3 w-px -translate-y-1/2 bg-[#eef1f2]/35"
                    />
                  ) : null}
                  <Link
                    href={item.href}
                    className="group relative whitespace-nowrap py-3 text-[12px] font-medium text-[#eef1f2]/78 transition hover:text-white min-[1120px]:text-[13px]"
                  >
                    {item.label}
                    <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-[#ff775c] transition-transform duration-300 group-hover:scale-x-100" />
                  </Link>
                </div>
              ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 min-[1120px]:gap-2">
          {locale === "vi" ? (
            <>
              <Link
                href="/dang-nhap"
                aria-label="Đăng nhập"
                title="Đăng nhập"
                className="hidden size-9 place-items-center rounded-[9px] border border-white/20 text-[#eef1f2] transition hover:-translate-y-px hover:border-[#ff775c] hover:text-[#ff775c] min-[980px]:grid"
              >
                <UserRound aria-hidden="true" size={17} />
              </Link>
              <Link
                href="/admin"
                aria-label="Quản trị"
                title="Quản trị"
                className="hidden size-9 place-items-center rounded-[9px] border border-white/20 text-[#eef1f2] transition hover:-translate-y-px hover:border-[#ff775c] hover:text-[#ff775c] min-[980px]:grid"
              >
                <ShieldCheck aria-hidden="true" size={17} />
              </Link>
            </>
          ) : null}
          {languageSwitch ? (
            <Link
              href={languageSwitch.href}
              className="hidden min-h-10 items-center justify-center border-l border-white/20 px-3 text-xs font-semibold tracking-[0.12em] text-[#eef1f2]/80 transition hover:text-white min-[980px]:inline-flex"
            >
              {languageSwitch.label}
            </Link>
          ) : null}
          <Link
            href={primaryCta.href}
            aria-label={primaryCta.label}
            target={primaryCtaIsExternal ? "_blank" : undefined}
            rel={primaryCtaIsExternal ? "noopener noreferrer" : undefined}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[9px] bg-[#eef1f2] px-3 text-sm font-semibold text-[#253957] transition hover:-translate-y-px hover:bg-white sm:px-4"
          >
            <span className="hidden min-[1120px]:inline">{primaryCta.label}</span>
            <span aria-hidden="true" className="min-[1120px]:hidden">
              {primaryCta.label.includes("Contact") ? "Contact" : "Tư vấn"}
            </span>
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
          <button
            type="button"
            aria-controls="mobile-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={menuLabel}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-[9px] border border-white/20 text-white transition hover:-translate-y-px hover:border-[#ff775c] min-[980px]:hidden"
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" size={18} />
            ) : (
              <Menu aria-hidden="true" size={18} />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <nav
          id="mobile-navigation"
          className="border-t border-[#253957]/12 bg-[#eef1f2] text-[#253957] min-[980px]:hidden"
          aria-label={mobileNavigationLabel}
        >
          <div className="mx-auto grid w-full max-w-7xl gap-2 px-4 py-3 sm:px-6">
            {locale === "vi"
              ? dronePillars.map((pillar) => (
                  <details
                    key={pillar.slug}
                    className="rounded-[9px] border border-[#253957]/12 bg-white px-3 text-sm"
                  >
                    <summary className="cursor-pointer py-3 font-semibold">
                      {pillar.title}
                    </summary>
                    <div className="grid gap-1 border-t border-[#253957]/10 py-2">
                      {pillar.items.map((item) => (
                        <Link
                          key={item.slug}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="rounded-[7px] px-2 py-2 text-[#253957]/78 transition hover:bg-[#eef1f2] hover:text-[#ff775c]"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))
              : navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-[9px] bg-white px-3 py-3 text-sm font-semibold text-[#253957] transition hover:text-[#ff775c]"
                  >
                    {item.label}
                  </Link>
                ))}
            {locale === "vi" ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/dang-nhap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-[9px] border border-[#253957]/14 bg-white px-3 py-3 text-center text-sm font-semibold"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-[9px] border border-[#253957]/14 bg-white px-3 py-3 text-center text-sm font-semibold"
                >
                  Quản trị
                </Link>
              </div>
            ) : null}
            {languageSwitch ? (
              <Link
                href={languageSwitch.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-[9px] border border-[#253957]/14 bg-white px-3 py-3 text-center text-sm font-semibold"
              >
                {languageSwitch.label}
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
