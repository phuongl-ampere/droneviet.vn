import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import type { CurriculumItem } from "@/lib/content/schema";

type CurriculumCardProps = {
  item: CurriculumItem;
  href?: string;
};

export function CurriculumCard({
  item,
  href = `/giao-trinh#${item.slug}`,
}: CurriculumCardProps) {
  return (
    <article className="group flex h-full flex-col border-t border-[#172226]/18 bg-white/55 px-1 py-7 transition hover:border-[#00A99B] sm:px-6">
      <div className="mb-7 flex items-start justify-between gap-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A681F]">
          {item.level}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {item.status}
        </span>
      </div>
      <h3 className="display-type text-3xl font-medium leading-tight tracking-[-0.025em] text-[#10232A]">
        {item.title}
      </h3>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#007F75]">
        {item.format}
      </p>
      <p className="mt-5 flex-1 text-sm leading-7 text-slate-600">
        {item.summary}
      </p>
      <ul className="mt-7 space-y-3 border-t border-[#172226]/10 pt-5 text-sm text-slate-700">
        {item.modules.slice(0, 3).map((module) => (
          <li key={module} className="flex gap-2">
            <Check aria-hidden="true" className="mt-0.5 shrink-0 text-[#00A99B]" size={15} />
            <span>{module}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-7 inline-flex w-fit items-center gap-2 border-b border-[#D69C54] pb-1 text-sm font-semibold text-[#172226] transition group-hover:border-[#00A99B]"
      >
        {item.downloadLabel}
        <ArrowUpRight aria-hidden="true" size={15} />
      </Link>
    </article>
  );
}
