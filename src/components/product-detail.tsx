import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { ServiceCard } from "@/components/service-card";
import type { DroneModel } from "@/lib/content/schema";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildProductJsonLd,
  buildServiceJsonLd,
} from "@/lib/seo";
import { getServices } from "@/lib/content";

type ProductDetailProps = {
  drone: DroneModel;
  locale: "vi" | "en";
};

function getCopy(locale: "vi" | "en") {
  return locale === "vi"
    ? {
        home: "Trang chủ",
        products: "Sản phẩm",
        eyebrow: "Cấu hình drone",
        outcomes: "Đầu ra học tập / nghiên cứu",
        specs: "Thông số triển khai",
        useCases: "Ứng dụng phù hợp",
        faqTitle: "Câu hỏi thường gặp",
        faqDescription: "Những thông tin cần biết trước khi lựa chọn cấu hình.",
        cta: "Liên hệ tư vấn ngay",
        related: "Dịch vụ đi cùng giải pháp",
        relatedDescription:
          "Từ thiết bị đến học liệu và năng lực vận hành, mỗi cấu hình đều có thể được triển khai trọn gói.",
        back: "Quay lại danh mục",
        faq: [
          {
            question: "Bộ drone này phù hợp với đơn vị nào?",
            answer:
              "Bộ drone được chọn theo cấp học, năng lực kỹ thuật, không gian bay và mục tiêu triển khai của từng trường, trung tâm hoặc lab.",
          },
          {
            question: "Drone Việt có hỗ trợ giáo trình và tập huấn không?",
            answer:
              "Có. Drone Việt cung cấp giáo trình, checklist an toàn, rubric đánh giá và chương trình tập huấn giáo viên hoặc giảng viên.",
          },
          {
            question: "Có thể tùy biến cho lab nghiên cứu không?",
            answer:
              "Có. Các cấu hình có thể mở rộng bằng cảm biến, camera, telemetry và protocol thử nghiệm cho đề tài nghiên cứu.",
          },
        ],
      }
    : {
        home: "Home",
        products: "Products",
        eyebrow: "Drone configuration",
        outcomes: "Learning / research outcomes",
        specs: "Deployment specs",
        useCases: "Best-fit use cases",
        faqTitle: "Frequently asked questions",
        faqDescription: "What to know before choosing a configuration.",
        cta: "Contact us now",
        related: "Services around the solution",
        relatedDescription:
          "From hardware to curriculum and operating readiness, every configuration can be deployed as a complete system.",
        back: "Back to catalog",
        faq: [
          {
            question: "Who is this drone kit for?",
            answer:
              "Each kit is matched to learner level, technical capability, flight space, and deployment goals for schools, centers, or labs.",
          },
          {
            question: "Does Drone Viet support curriculum and training?",
            answer:
              "Yes. Drone Viet provides curriculum, safety checklists, assessment rubrics, and teacher or instructor training.",
          },
          {
            question: "Can it be customized for research labs?",
            answer:
              "Yes. Configurations can be extended with sensors, cameras, telemetry, and experiment protocols for research topics.",
          },
        ],
      };
}

export function ProductDroneVisual() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 220"
      className="relative z-10 h-auto w-full max-w-lg drop-shadow-[0_34px_26px_rgba(0,0,0,0.36)]"
    >
      <g fill="none" stroke="#D9F6F2" strokeWidth="4">
        <ellipse cx="72" cy="58" rx="48" ry="17" />
        <ellipse cx="288" cy="58" rx="48" ry="17" />
        <ellipse cx="72" cy="162" rx="48" ry="17" />
        <ellipse cx="288" cy="162" rx="48" ry="17" />
        <path d="m100 70 55 27m105-27-55 27M100 150l55-27m105 27-55-27" />
      </g>
      <path d="M145 84h70l25 26-25 29h-70l-25-29Z" fill="#D9F6F2" />
      <path d="M161 96h38l15 14-15 17h-38l-15-17Z" fill="#00A99B" />
      <circle cx="180" cy="150" r="9" fill="#D69C54" />
    </svg>
  );
}

export function ProductDetail({ drone, locale }: ProductDetailProps) {
  const copy = getCopy(locale);
  const productPath =
    locale === "vi" ? `/san-pham/${drone.slug}` : `/en/products/${drone.slug}`;
  const productsPath = locale === "vi" ? "/san-pham" : "/en/products";
  const servicesPath = locale === "vi" ? "/dich-vu" : "/en/services";
  const services = getServices(locale).slice(0, 3);

  return (
    <>
      <JsonLd data={buildProductJsonLd(drone, locale)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: copy.home, url: locale === "vi" ? "/" : "/en" },
          { name: copy.products, url: productsPath },
          { name: drone.name, url: productPath },
        ])}
      />
      <JsonLd data={buildFaqJsonLd(copy.faq)} />
      {services.map((service) => (
        <JsonLd key={service.slug} data={buildServiceJsonLd(service, locale)} />
      ))}

      <section className="relative overflow-hidden bg-[#071117] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_38%,rgba(0,209,193,0.14),transparent_30%)]" />
        <div className="relative mx-auto grid min-h-[calc(100svh-80px)] w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <Link
              href={productsPath}
              className="mb-12 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft aria-hidden="true" size={15} />
              {copy.back}
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7DE0D7]">
              {copy.eyebrow} · {drone.level}
            </p>
            <h1 className="display-type text-balance mt-5 text-5xl font-medium leading-[0.96] tracking-[-0.045em] sm:text-7xl">
              {drone.name}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {drone.summary}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {drone.useCases.map((useCase) => (
                <span
                  key={useCase}
                  className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-slate-300"
                >
                  {useCase}
                </span>
              ))}
            </div>
            <Link
              href="https://zalo.me/0384070636"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#10232A] transition hover:bg-[#00D1C1]"
            >
              {copy.cta}
              <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
          </div>

          <div className="relative grid min-h-[24rem] place-items-center overflow-hidden rounded-[2rem] border border-white/10 bg-[#10232A]/65 p-8 shadow-2xl shadow-black/30 backdrop-blur sm:min-h-[32rem]">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(217,246,242,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(217,246,242,0.08)_1px,transparent_1px)] [background-size:60px_60px]" />
            <div className="absolute bottom-16 h-20 w-3/5 rounded-[100%] bg-[#00D1C1]/12 blur-2xl" />
            <ProductDroneVisual />
          </div>
        </div>
      </section>

      <section className="bg-[#F5F7F4] py-24 text-[#172226] sm:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#007F75]">
              {copy.outcomes}
            </p>
            <h2 className="display-type mt-5 text-4xl font-medium leading-tight tracking-[-0.035em] text-[#10232A] sm:text-5xl">
              {copy.useCases}
            </h2>
            <div className="mt-8 space-y-4">
              {drone.learningOutcomes.map((outcome) => (
                <p key={outcome} className="flex gap-3 border-t border-[#172226]/12 pt-4 text-sm leading-7 text-slate-700">
                  <Check aria-hidden="true" className="mt-1 shrink-0 text-[#00A99B]" size={16} />
                  <span>{outcome}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_20px_70px_rgba(16,35,42,0.07)] sm:p-9">
            <h2 className="display-type text-3xl font-medium tracking-[-0.025em] text-[#10232A]">
              {copy.specs}
            </h2>
            <table aria-label={copy.specs} className="mt-7 w-full border-collapse text-left">
              <tbody>
                {drone.specs.map((spec) => (
                  <tr key={spec.label} className="border-t border-[#172226]/10">
                    <th scope="row" className="py-5 pr-4 text-xs font-medium text-slate-500">
                      {spec.label}
                    </th>
                    <td className="py-5 text-right text-sm font-semibold text-[#172226]">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#007F75]">
              FAQ
            </p>
            <h2 className="display-type mt-5 text-4xl font-medium leading-tight tracking-[-0.035em] text-[#10232A] sm:text-5xl">
              {copy.faqTitle}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">{copy.faqDescription}</p>
          </div>
          <div>
            {copy.faq.map((item) => (
              <article key={item.question} className="border-t border-[#172226]/14 py-7">
                <h3 className="display-type text-2xl font-medium text-[#10232A]">
                  {item.question}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#10232A] py-24 text-white sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_5%,rgba(0,169,155,0.13),transparent_30%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 border-t border-white/15 pt-6 md:grid-cols-[0.72fr_1.28fr]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7DE0D7]">
              {copy.related}
            </p>
            <div>
              <h2 className="display-type text-4xl font-medium leading-tight tracking-[-0.035em] sm:text-5xl">
                {copy.relatedDescription}
              </h2>
            </div>
          </div>
          <div className="mt-14 grid gap-x-10 md:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                href={`${servicesPath}#${service.slug}`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
