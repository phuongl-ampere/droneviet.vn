import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/content";
import {
  getDronePillar,
  getDronePillarItem,
  type DronePillar,
} from "@/lib/drone-pillars";
import { getTranslation } from "@/lib/i18n";

export function DronePillarDetail({
  pillarSlug,
  topicSlug,
  locale = "vi",
}: {
  pillarSlug: string;
  topicSlug: string;
  locale?: Locale;
}) {
  const pillar = getDronePillar(pillarSlug, locale);
  const topic = getDronePillarItem(pillarSlug, topicSlug, locale);

  if (!pillar || !topic) {
    notFound();
  }

  return (
    <PillarDetail
      locale={locale}
      pillar={pillar}
      title={topic.title}
      description={topic.description}
    />
  );
}

function PillarDetail({
  pillar,
  title,
  description,
  locale,
}: {
  pillar: DronePillar;
  title: string;
  description: string;
  locale: Locale;
}) {
  return (
    <main className="bg-white text-[#10232A]">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <Link className="text-sm font-semibold text-[#006D66] hover:text-[#10232A]" href={locale === "vi" ? "/" : "/en"}>
            {getTranslation(locale, "common.home")}
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-[#007F75]">
            {pillar.eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            {description}
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-4xl gap-8 px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-lg leading-9 text-slate-700">
          {getTranslation(locale, "pillar.overview")}
        </p>
        <Link
          className="inline-flex min-h-11 w-fit items-center gap-2 bg-[#10232A] px-4 text-sm font-semibold text-white hover:bg-[#006D66]"
          href={locale === "vi" ? "/bao-gia" : "/en/quote"}
        >
          {getTranslation(locale, "pillar.requestConsultation")}
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </section>
    </main>
  );
}
