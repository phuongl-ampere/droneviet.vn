import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type LinkItem = {
  label: string;
  href: string;
};

type SiteFooterProps = {
  brandName: string;
  tagline: string;
  navigation: LinkItem[];
  locale?: "vi" | "en";
};

export function SiteFooter({
  brandName,
  tagline,
  navigation,
  locale = "vi",
}: SiteFooterProps) {
  const descriptor =
    locale === "vi" ? "Hệ thống nghiên cứu & giáo dục" : "Research & education systems";
  const navigationLabel = locale === "vi" ? "Liên kết cuối trang" : "Footer navigation";
  const contactLabel = locale === "vi" ? "Trao đổi dự án" : "Discuss a project";

  return (
    <footer className="border-t border-white/8 bg-[#071117] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.35fr_0.65fr] md:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00D1C1]">
            {descriptor}
          </p>
          <p className="display-type mt-5 text-4xl leading-none sm:text-5xl">{brandName}</p>
          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400">{tagline}</p>
          <Link
            href="https://zalo.me/0384070636"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-[#00D1C1]/60 text-sm font-semibold text-white transition hover:border-white"
          >
            {contactLabel}
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>

        <nav className="grid content-start gap-4 sm:grid-cols-2 md:grid-cols-1" aria-label={navigationLabel}>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-fit text-sm text-slate-400 transition hover:translate-x-1 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/8 px-5 py-5 text-center text-[11px] uppercase tracking-[0.16em] text-slate-600 sm:px-8">
        © {new Date().getFullYear()} {brandName}
      </div>
    </footer>
  );
}
