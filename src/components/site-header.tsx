import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

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
  const primaryCtaIsExternal = primaryCta.href.startsWith("http");
  const navigationLabel = locale === "vi" ? "Điều hướng chính" : "Main navigation";
  const mobileNavigationLabel =
    locale === "vi" ? "Điều hướng trên điện thoại" : "Mobile navigation";

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#071117]/94 text-white backdrop-blur-2xl">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Link
          href={homeHref}
          className="group flex items-center gap-3.5"
          aria-label={brandName}
        >
          <span className="relative grid size-10 place-items-center rounded-full border border-white/14 bg-white/5 transition group-hover:border-[#00D1C1]/45">
            <span className="h-px w-5 bg-[#00D1C1]" />
            <span className="absolute h-5 w-px bg-[#00D1C1]" />
            <span className="absolute size-2 rounded-full border border-[#00D1C1] bg-[#071117]" />
          </span>
          <span>
            <span className="block text-[15px] font-semibold tracking-[-0.01em]">{brandName}</span>
            <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:block">
              Research · Education
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={navigationLabel}>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-3 text-[13px] font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
              <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-[#00D1C1] transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {languageSwitch ? (
            <Link
              href={languageSwitch.href}
              className="inline-flex min-h-11 items-center justify-center border-l border-white/12 px-3 text-xs font-semibold tracking-[0.12em] text-slate-300 transition hover:text-white"
            >
              {languageSwitch.label}
            </Link>
          ) : null}
          <Link
            href={primaryCta.href}
            aria-label={primaryCta.label}
            target={primaryCtaIsExternal ? "_blank" : undefined}
            rel={primaryCtaIsExternal ? "noopener noreferrer" : undefined}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#10232A] transition hover:bg-[#00D1C1] sm:px-5"
          >
            <span className="hidden sm:inline">{primaryCta.label}</span>
            <span aria-hidden="true" className="sm:hidden">
              {primaryCta.label.includes("Contact") ? "Contact" : "Tư vấn"}
            </span>
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </div>
      <nav
        className="mx-auto flex w-full max-w-7xl gap-6 overflow-x-auto border-t border-white/8 px-5 py-2.5 lg:hidden"
        aria-label={mobileNavigationLabel}
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 border-b border-transparent py-1.5 text-xs font-medium text-slate-300 transition hover:border-[#00D1C1] hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
