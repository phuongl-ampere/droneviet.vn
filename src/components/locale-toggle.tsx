"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getTranslation } from "@/lib/i18n";

export function LocaleToggle({
  locale,
  alternateHref,
}: {
  locale: "en" | "vi";
  alternateHref: string;
}) {
  return (
    <Suspense
      fallback={
        <LocaleToggleLinks
          locale={locale}
          alternateHref={alternateHref}
        />
      }
    >
      <LocaleToggleWithSearch
        locale={locale}
        alternateHref={alternateHref}
      />
    </Suspense>
  );
}

function LocaleToggleWithSearch({
  locale,
  alternateHref,
}: {
  locale: "en" | "vi";
  alternateHref: string;
}) {
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return (
    <LocaleToggleLinks
      locale={locale}
      alternateHref={`${alternateHref}${search ? `?${search}` : ""}`}
    />
  );
}

function LocaleToggleLinks({
  locale,
  alternateHref,
}: {
  locale: "en" | "vi";
  alternateHref: string;
}) {
  const label = getTranslation(locale, "locale.label");
  const currentCode = getTranslation(
    locale,
    locale === "vi" ? "locale.vietnameseCode" : "locale.englishCode",
  );
  const alternateCode = getTranslation(
    locale,
    locale === "vi" ? "locale.englishCode" : "locale.vietnameseCode",
  );

  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-label={`${label}: ${currentCode}`}
        className="inline-flex min-h-8 items-center gap-1 px-2 text-xs font-semibold tracking-[0.12em] text-slate-300 transition hover:text-white focus:text-white"
      >
        {currentCode}
        <ChevronDown aria-hidden="true" size={13} />
      </button>
      <div className="invisible absolute right-0 top-full z-50 w-20 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div
          role="menu"
          aria-label={label}
          className="border border-white/12 bg-[#10232A] p-1 shadow-2xl"
        >
          <span
            role="menuitem"
            aria-current="true"
            className="block px-2 py-1.5 text-xs font-semibold text-white"
          >
            {currentCode}
          </span>
          <Link
            role="menuitem"
            href={alternateHref}
            className="block px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-white/8 hover:text-white focus:bg-white/8 focus:text-white"
          >
            {alternateCode}
          </Link>
        </div>
      </div>
    </div>
  );
}
