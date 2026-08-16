import { ArrowUpRight, Check, MoveUpRight } from "lucide-react";
import Link from "next/link";
import { DroneLabShowroom } from "@/components/drone-lab-showroom";
import { SectionShell } from "@/components/section-shell";
import { dronePillars } from "@/lib/drone-pillars";
import {
  getDroneModels,
  getServices,
  getSiteContent,
  type Locale,
} from "@/lib/content";
import type { DroneModel } from "@/lib/content/schema";

const homeCopy = {
  vi: {
    solutionEyebrow: "Solution catalog",
    solutionTitle: "Một nền tảng drone cho mọi cấp độ học tập",
    solutionDescription:
      "Bốn cấu hình trọng điểm kết nối thiết bị, học liệu và dữ liệu — từ chuyến bay đầu tiên đến đề tài nghiên cứu.",
    servicesEyebrow: "Services",
    servicesTitle: "Từ chuyến bay đầu tiên đến một phòng lab vận hành được",
    servicesDescription:
      "Thiết bị chỉ là điểm bắt đầu. Drone Việt đồng hành từ thiết kế cấu hình đến chuyển giao và đào tạo.",
    processEyebrow: "Deployment",
    processTitle: "Lộ trình rõ ràng từ yêu cầu đến triển khai",
    processDescription:
      "Ba bước có kiểm soát để giải pháp phù hợp mục tiêu, không gian và năng lực vận hành thực tế.",
    viewProduct: "Xem cấu hình",
    featured: "Cấu hình tiêu biểu",
  },
  en: {
    solutionEyebrow: "Solution catalog",
    solutionTitle: "A drone platform for every stage of learning",
    solutionDescription:
      "Four core configurations connect hardware, curriculum, and data — from a first flight to applied research.",
    servicesEyebrow: "Services",
    servicesTitle: "From first flight to a working lab",
    servicesDescription:
      "Hardware is only the beginning. Drone Viet supports configuration, transfer, and instructor readiness.",
    processEyebrow: "Deployment",
    processTitle: "A clear path from brief to deployment",
    processDescription:
      "Three controlled steps align the solution with real objectives, space, and operating capability.",
    viewProduct: "View configuration",
    featured: "Featured configuration",
  },
} satisfies Record<Locale, Record<string, string>>;

function DroneMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 260 150" className="h-32 w-56 sm:h-40 sm:w-72">
      <g fill="none" stroke="currentColor" strokeWidth="3">
        <ellipse cx="52" cy="42" rx="34" ry="12" />
        <ellipse cx="208" cy="42" rx="34" ry="12" />
        <ellipse cx="52" cy="108" rx="34" ry="12" />
        <ellipse cx="208" cy="108" rx="34" ry="12" />
        <path d="M72 50 112 68M188 50 148 68M72 100l40-20m76 20-40-20" />
      </g>
      <path d="M106 59h48l16 16-16 18h-48L90 75Z" fill="currentColor" />
      <path d="M118 66h24l9 9-9 10h-24l-9-10Z" fill="#00A99B" />
    </svg>
  );
}

function FeaturedSolution({
  drone,
  index,
  locale,
}: {
  drone: DroneModel;
  index: number;
  locale: Locale;
}) {
  const copy = homeCopy[locale];
  const hrefBase = locale === "vi" ? "/san-pham" : "/en/products";
  const isLead = index === 0;

  return (
    <article
      className={
        isLead
          ? "group relative overflow-hidden border-t border-[#172226]/16 bg-white p-7 md:col-span-2 md:grid md:min-h-[34rem] md:grid-cols-[0.9fr_1.1fr] md:items-end md:p-10 lg:row-span-2 lg:col-span-1"
          : "group flex min-h-[16rem] flex-col border-t border-[#172226]/16 py-7 sm:px-5"
      }
    >
      <div
        className={
          isLead
            ? "relative order-2 mt-12 md:order-1 md:mt-0"
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
      {isLead ? (
        <div className="relative order-1 grid place-items-center text-[#10232A] md:order-2 md:self-center">
          <DroneMark />
        </div>
      ) : null}
    </article>
  );
}

export function HomePageContent({ locale = "vi" }: { locale?: Locale }) {
  const site = getSiteContent(locale);
  const featuredDrones = getDroneModels(locale).filter((drone) => drone.featured);
  const services = getServices(locale).slice(0, 3);
  const copy = homeCopy[locale];

  return (
    <>
      <DroneLabShowroom
        locale={locale}
        eyebrow={site.hero.eyebrow}
        title={site.hero.title}
        description={site.hero.description}
        primaryCta={site.hero.primaryCta}
        secondaryCta={site.hero.secondaryCta}
        drones={getDroneModels(locale)}
      />

      <SectionShell
        eyebrow="Drone Việt"
        title="Chọn đúng hành trình drone"
      >
        <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-3">
          {dronePillars.map((pillar) => (
            <article
              key={pillar.slug}
              className="group border-t border-[#172226]/16 py-7"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {pillar.eyebrow}
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-[#10232A]">
                {pillar.title}
              </h2>
              <div className="mt-4 grid gap-2 text-sm md:hidden md:group-hover:grid">
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

export default function Home() {
  return <HomePageContent locale="vi" />;
}
