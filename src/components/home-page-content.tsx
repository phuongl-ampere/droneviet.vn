import { ArrowUpRight, Check, MoveUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionShell } from "@/components/section-shell";
import { getDronePillars } from "@/lib/drone-pillars";
import { getTranslations } from "@/lib/i18n";
import {
  getDroneModels,
  getServices,
  getSiteContent,
  type Locale,
} from "@/lib/content";
import type { DroneModel } from "@/lib/content/schema";

function FeaturedSolution({
  drone,
  index,
  locale,
}: {
  drone: DroneModel;
  index: number;
  locale: Locale;
}) {
  const copy = getTranslations(locale).home;
  const hrefBase = locale === "vi" ? "/san-pham" : "/en/products";
  const isLead = index === 0;

  return (
    <article
      className={
        isLead
          ? "group relative overflow-hidden border-t border-[#172226]/16 bg-white p-7 md:col-span-2 md:min-h-[34rem] md:p-10 lg:row-span-2 lg:col-span-1"
          : "group flex min-h-[16rem] flex-col border-t border-[#172226]/16 py-7 sm:px-5"
      }
    >
      <div
        className={
          isLead
            ? "relative"
            : "flex flex-1 flex-col"
        }
      >
        <p
          className={
            isLead
              ? "text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              : "text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500"
          }
        >
          {isLead ? copy.featured : drone.level}
        </p>
        <h3
          className={`display-type mt-4 font-medium leading-none tracking-[-0.035em] ${
            isLead ? "text-5xl text-[#10232A] sm:text-6xl" : "text-3xl text-[#10232A]"
          }`}
        >
          {drone.name}
        </h3>
        <p className="mt-5 text-sm leading-7 text-slate-600">
          {drone.summary}
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {drone.useCases.slice(0, 2).map((useCase) => (
            <span
              key={useCase}
              className="text-xs text-slate-500"
            >
              {useCase}
            </span>
          ))}
        </div>
        <Link
          href={`${hrefBase}/${drone.slug}`}
          className="mt-8 inline-flex w-fit items-center gap-2 border-b border-[#00A99B]/50 pb-1 text-sm font-semibold text-[#006D66] transition hover:border-[#10232A] hover:text-[#10232A]"
        >
          {copy.viewProduct}
          <ArrowUpRight aria-hidden="true" size={15} />
        </Link>
      </div>
    </article>
  );
}

function StaticHomeHero({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <section
      data-testid="home-static-hero"
      className="relative isolate min-h-[28rem] overflow-hidden bg-[#071117] text-white sm:min-h-[34rem]"
    >
      <Image
        alt={title}
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src="/store/quadcopter-flight-01.jpg"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#071117]/80 via-[#071117]/18 to-transparent"
      />
      <div className="relative mx-auto flex min-h-[28rem] w-full max-w-7xl items-end px-5 py-10 sm:min-h-[34rem] sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7DE0D7]">
            {eyebrow}
          </p>
          <h1 className="display-type mt-4 text-4xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-6xl">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}

export function HomePageContent({ locale = "vi" }: { locale?: Locale }) {
  const site = getSiteContent(locale);
  const featuredDrones = getDroneModels(locale).filter((drone) => drone.featured);
  const services = getServices(locale).slice(0, 3);
  const copy = getTranslations(locale).home;
  const pillars = getDronePillars(locale);

  return (
    <>
      <StaticHomeHero eyebrow={site.hero.eyebrow} title={site.hero.title} />

      <SectionShell
        eyebrow={copy.pillarEyebrow}
        title={copy.pillarTitle}
      >
        <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.slug}
              className="group relative border-t border-[#172226]/16 py-7"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {pillar.eyebrow}
              </p>
              {pillar.slug === "cua-hang" ? (
                <Link
                  href={locale === "vi" ? "/cua-hang" : "/en/store"}
                  aria-label={copy.storeLink}
                  className="relative z-10 mt-4 inline-block text-2xl font-semibold text-[#10232A] transition hover:text-[#006D66] focus:text-[#006D66]"
                >
                  {pillar.title}
                </Link>
              ) : (
                <h2 className="mt-4 text-2xl font-semibold text-[#10232A]">
                  {pillar.title}
                </h2>
              )}
              {pillar.slug === "cua-hang" ? (
                <div
                  data-testid="home-store-categories"
                  className="relative z-10 mt-4 grid gap-2 text-sm md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-[max-height,opacity] md:duration-300 md:group-hover:max-h-40 md:group-hover:opacity-100 md:group-focus-within:max-h-40 md:group-focus-within:opacity-100"
                >
                  {pillar.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="inline-flex items-center gap-2 text-slate-600 hover:text-[#006D66]"
                    >
                      <ArrowUpRight aria-hidden="true" size={14} />
                      {item.title}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="relative z-10 mt-4 grid gap-2 text-sm md:hidden md:group-hover:grid">
                  {pillar.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="inline-flex items-center gap-2 text-slate-600 hover:text-[#006D66]"
                    >
                      <ArrowUpRight aria-hidden="true" size={14} />
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={copy.solutionEyebrow}
        title={copy.solutionTitle}
        description={copy.solutionDescription}
      >
        <div className="grid gap-x-10 gap-y-2 lg:grid-cols-[1.08fr_0.92fr]">
          {featuredDrones.map((drone, index) => (
            <FeaturedSolution key={drone.slug} drone={drone} index={index} locale={locale} />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={copy.servicesEyebrow}
        title={copy.servicesTitle}
        description={copy.servicesDescription}
      >
        <div className="grid gap-x-10 md:grid-cols-3">
          {services.map((service) => (
            <article key={service.slug} className="border-t border-[#172226]/16 py-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {service.audience.slice(0, 2).join(" · ")}
              </p>
              <h3 className="display-type mt-5 text-3xl font-medium leading-tight text-[#10232A]">
                {service.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{service.summary}</p>
              <div className="mt-6 space-y-3">
                {service.deliverables.slice(0, 2).map((deliverable) => (
                  <p key={deliverable} className="flex gap-2 text-sm text-slate-600">
                    <Check aria-hidden="true" className="mt-0.5 text-[#10232A]" size={15} />
                    {deliverable}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={copy.processEyebrow}
        title={copy.processTitle}
        description={copy.processDescription}
      >
        <div className="relative grid gap-0 md:grid-cols-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            className="pointer-events-none absolute left-0 top-8 hidden h-24 w-full text-[#172226]/15 md:block"
          >
            <path d="M20 70C220 5 315 115 500 55S790 10 980 65" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          {site.process.map((step, index) => (
            <article
              key={step.title}
              className="relative border-t border-[#172226]/18 py-8 md:min-h-72 md:px-7"
            >
              <div className="flex items-center justify-between">
                <span className="display-type text-4xl italic text-[#10232A]/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <MoveUpRight aria-hidden="true" className="text-[#D69C54]" size={20} />
              </div>
              <h3 className="display-type mt-12 text-3xl font-medium leading-tight text-[#10232A]">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{step.summary}</p>
            </article>
          ))}
        </div>
      </SectionShell>
    </>
  );
}
