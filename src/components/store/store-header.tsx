"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CustomerAccountMenu } from "@/components/customer/customer-account-menu";
import { useI18n } from "@/components/i18n-provider";
import { LocaleToggle } from "@/components/locale-toggle";
import { useCart } from "./cart-provider";

export function StoreHeader({
  locale = "vi",
  alternateHref,
}: {
  locale?: "en" | "vi";
  alternateHref?: string;
}) {
  const { lineCount } = useCart();
  const { t } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const storeHref = locale === "vi" ? "/cua-hang" : "/en/store";
  const cartHref = locale === "vi" ? "/gio-hang" : "/en/cart";
  const loginHref = locale === "vi" ? "/dang-nhap" : "/en/login";
  const accountHref = locale === "vi" ? "/tai-khoan" : "/en/account";
  const items = [
    { href: `${storeHref}?category=drone`, label: t("store.navDrones") },
    { href: `${storeHref}?category=parts`, label: t("store.navParts") },
    {
      href: `${storeHref}?category=education`,
      label: t("store.navEducation"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#071117]/94 text-white backdrop-blur-2xl">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:gap-5 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-1 sm:gap-3.5 lg:justify-self-start">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("store.closeMenu") : t("store.openMenu")}
            title={menuOpen ? t("store.closeMenu") : t("store.openMenu")}
            onClick={() => setMenuOpen((current) => !current)}
            className="grid size-9 shrink-0 place-items-center lg:hidden hover:bg-white/10"
          >
            {menuOpen ? (
              <X aria-hidden="true" size={18} />
            ) : (
              <Menu aria-hidden="true" size={18} />
            )}
          </button>
          <Link
            href={locale === "vi" ? "/" : "/en"}
            aria-label={t("common.brandAscii")}
            className="group flex min-w-0 items-center gap-2 sm:gap-3.5"
          >
            <span className="relative size-10 shrink-0">
              <Image
                alt=""
                data-testid="store-brand-logo"
                fill
                priority
                sizes="40px"
                src="/logo.png"
                className="object-contain"
              />
            </span>
            <span className="hidden sm:block">
              <span className="block text-[15px] font-semibold tracking-[-0.01em]">
                {t("common.brandAscii")}
              </span>
              <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:block">
                {t("header.researchEducation")}
              </span>
            </span>
          </Link>
        </div>
        <nav
          aria-label={t("store.navigation")}
          className="hidden items-center gap-5 lg:justify-self-center lg:flex"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-3 text-[13px] font-medium text-slate-300 transition hover:text-white focus:text-white"
            >
              {item.label}
              <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-[#00D1C1] transition-transform duration-300 group-hover:scale-x-100 group-focus:scale-x-100" />
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:justify-self-end">
          {searchOpen ? (
            <form
              action={storeHref}
              data-testid="store-inline-search"
              className="hidden h-10 items-center border border-white/20 bg-white/5 px-3 sm:flex"
            >
              <label>
                <span className="sr-only">{t("store.searchDevices")}</span>
                <input
                  name="q"
                  autoFocus
                  placeholder={t("store.searchPlaceholder")}
                  className="w-44 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>
            </form>
          ) : null}
          <button
            type="button"
            aria-label={searchOpen ? t("store.closeMenu") : t("store.search")}
            title={searchOpen ? t("store.closeMenu") : t("store.search")}
            onClick={() => setSearchOpen((current) => !current)}
            className="grid size-10 place-items-center hover:bg-white/10"
          >
            <Search aria-hidden="true" size={18} />
          </button>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/15" />
          {alternateHref ? (
            <LocaleToggle locale={locale} alternateHref={alternateHref} />
          ) : null}
          <Link
            href={cartHref}
            aria-label={t("store.cartItemCount", { count: lineCount })}
            title={t("cart.title")}
            className="relative grid size-10 place-items-center hover:bg-white/10"
          >
            <ShoppingBag aria-hidden="true" size={18} />
            {lineCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center bg-white text-[10px] font-bold text-[#006D66]">
                {lineCount}
              </span>
            ) : null}
          </Link>
          <CustomerAccountMenu
            accountHref={accountHref}
            loginHref={loginHref}
            className="grid size-10 place-items-center rounded-full hover:bg-white/10"
          />
        </div>
      </div>

      {searchOpen ? (
        <form
          action={storeHref}
          className="border-t border-black/10 bg-white px-5 py-3 text-[#10232A] sm:hidden"
        >
          <label className="mx-auto flex max-w-[90rem] items-center gap-3">
            <Search aria-hidden="true" size={17} />
            <span className="sr-only">{t("store.searchDevices")}</span>
            <input
              name="q"
              autoFocus
              placeholder={t("store.searchPlaceholder")}
              className="min-h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        </form>
      ) : null}

      {menuOpen ? (
        <nav
          aria-label={t("store.mobileNavigation")}
          className="border-t border-white/8 bg-[#071117] px-5 py-4 lg:hidden"
        >
          <div className="grid gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/15 py-3 text-sm font-medium text-white/90 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
