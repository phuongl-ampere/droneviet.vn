import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import type { Service } from "@/lib/content/schema";

type ServiceCardProps = {
  service: Service;
  href?: string;
};

export function ServiceCard({
  service,
  href = `/dich-vu#${service.slug}`,
}: ServiceCardProps) {
  return (
    <article className="group flex h-full flex-col border-t border-white/20 px-1 py-7 text-white transition hover:border-[#7DE0D7] sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7DE0D7]">
        {service.audience.slice(0, 2).join(" · ")}
      </p>
      <h3 className="display-type mt-5 text-3xl font-medium leading-tight tracking-[-0.02em]">
        {service.title}
      </h3>
      <p className="mt-5 flex-1 text-sm leading-7 text-slate-300">
        {service.summary}
      </p>
      <ul className="mt-7 space-y-3 border-t border-white/10 pt-5 text-sm text-slate-300">
        {service.deliverables.slice(0, 3).map((deliverable) => (
          <li key={deliverable} className="flex gap-2">
            <Check aria-hidden="true" className="mt-0.5 shrink-0 text-[#7DE0D7]" size={16} />
            <span>{deliverable}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-7 inline-flex w-fit items-center gap-2 border-b border-[#7DE0D7]/60 pb-1 text-sm font-semibold text-white transition group-hover:border-white"
      >
        {service.ctaLabel}
        <ArrowUpRight aria-hidden="true" size={15} />
      </Link>
    </article>
  );
}
