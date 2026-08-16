import { ArrowUpRight, Mail, MessageCircle, UserRound } from "lucide-react";
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

        <nav className="hidden items-center gap-5 lg:flex" aria-label={navigationLabel}>
          {locale === "vi"
            ? dronePillars.map((pillar) => (
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
              ))
            : navigation.map((item) => (
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
          {locale === "vi" ? (
            <>
              <Link
                href="https://zalo.me/0384070636"
                aria-label="Zalo"
                title="Zalo"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center border border-white/12 text-slate-200 transition hover:border-[#00D1C1] hover:text-[#00D1C1]"
              >
                <MessageCircle aria-hidden="true" size={17} />
              </Link>
              <Link
                href="mailto:admin@droneviet.vn"
                aria-label="Gmail"
                title="Gmail"
                className="grid size-10 place-items-center border border-white/12 text-slate-200 transition hover:border-[#00D1C1] hover:text-[#00D1C1]"
              >
                <Mail aria-hidden="true" size={17} />
              </Link>
              <Link
                href="/admin"
                aria-label="Đăng nhập"
                title="Đăng nhập"
                className="grid size-10 place-items-center border border-white/12 text-slate-200 transition hover:border-[#00D1C1] hover:text-[#00D1C1]"
              >
                <UserRound aria-hidden="true" size={17} />
              </Link>
            </>
          ) : null}
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
        className="mx-auto grid w-full max-w-7xl gap-3 border-t border-white/8 px-5 py-3 lg:hidden"
        aria-label={mobileNavigationLabel}
      >
          {locale === "vi"
            ? dronePillars.map((pillar) => (
                <details
                  key={pillar.slug}
                  className="border-b border-white/8 pb-2 text-xs text-slate-300"
                >
                  <summary className="cursor-pointer py-1.5 font-medium">{pillar.title}</summary>
                  <div className="grid gap-2 py-2 pl-3">
                    {pillar.items.map((item) => (
                      <Link
                        key={item.slug}
                        href={item.href}
                        className="text-slate-400 hover:text-[#7DE0D7]"
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
                  className="shrink-0 border-b border-transparent py-1.5 text-xs font-medium text-slate-300 transition hover:border-[#00D1C1] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
      </nav>
    </header>
  );
}
