import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/content";
import type { DroneModel } from "@/lib/content/schema";
import { getTranslation } from "@/lib/i18n";

type DroneCardProps = {
  drone: DroneModel;
  detailBasePath?: string;
  locale?: Locale;
};

export function DroneCard({
  drone,
  detailBasePath = "/san-pham",
  locale = "vi",
}: DroneCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-[#172226]/10 bg-white transition hover:border-[#10232A]/40">
      <div className="relative min-h-56 overflow-hidden bg-[#E8EFEC]">
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(16,35,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(16,35,42,0.06)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="absolute inset-x-12 bottom-5 h-12 rounded-[100%] bg-[#10232A]/10 blur-xl" />
        <div className="relative z-10 flex h-56 items-center justify-center transition duration-700 group-hover:-translate-y-1 group-hover:scale-[1.03]">
          <svg
            aria-hidden="true"
            viewBox="0 0 260 150"
            className="h-36 w-64 drop-shadow-[0_20px_18px_rgba(7,17,23,0.18)]"
          >
            <g fill="none" stroke="#10232A" strokeWidth="4">
              <ellipse cx="52" cy="42" rx="34" ry="12" />
              <ellipse cx="208" cy="42" rx="34" ry="12" />
              <ellipse cx="52" cy="108" rx="34" ry="12" />
              <ellipse cx="208" cy="108" rx="34" ry="12" />
              <path d="M72 50 112 68M188 50 148 68M72 100l40-20m76 20-40-20" />
            </g>
            <path d="M106 59h48l16 16-16 18h-48L90 75Z" fill="#10232A" />
            <path d="M118 66h24l9 9-9 10h-24l-9-10Z" fill="#00A99B" />
            <circle cx="130" cy="96" r="6" fill="#D69C54" />
          </svg>
        </div>
        <span className="absolute left-5 top-5 rounded-full border border-[#10232A]/10 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#10232A] backdrop-blur">
          {drone.level}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {drone.useCases[0]}
        </p>
        <h3 className="display-type mt-3 text-3xl font-medium tracking-[-0.025em] text-[#10232A]">
          {drone.name}
        </h3>
        <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
          {drone.summary}
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-x-5 border-y border-[#172226]/10 py-4">
          {drone.specs.slice(0, 2).map((spec) => (
            <div key={spec.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {spec.label}
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-[#172226]">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <Link
          href={`${detailBasePath}/${drone.slug}`}
          className="mt-6 inline-flex w-fit items-center gap-2 border-b border-[#00A99B]/50 pb-1 text-sm font-semibold text-[#006D66] transition group-hover:border-[#10232A] group-hover:text-[#10232A]"
        >
          {getTranslation(locale, "product.detail")}
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </article>
  );
}
