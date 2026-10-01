import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { formatVnd } from "@/lib/commerce/storefront-catalog";
import { getStoreCourses } from "@/lib/commerce/courses";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/content";

export interface CourseDetailPageProps {
  locale?: Locale;
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({
  locale = "vi",
  params,
}: CourseDetailPageProps) {
  const copy = getTranslations(locale).course;
  const { slug } = await params;
  const course = getStoreCourses(locale).find((item) => item.slug === slug);
  const coursesHref = locale === "vi" ? "/khoa-hoc" : "/en/courses";
  const solutionsHref = locale === "vi" ? "/dich-vu" : "/en/services";

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-[#10232A]">
      <section className="bg-[#10232A] text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <Link
            href={coursesHref}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.backToCourses}
          </Link>
          <p className="mt-12 text-xs font-medium text-[#7DE0D7]">
            {course.level} · {course.format}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            {course.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            {course.summary}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <p className="text-sm text-slate-300">{course.sessionLabel}</p>
            {course.purchaseMode === "checkout" ? (
              <p className="text-xl font-semibold">
                {formatVnd(course.priceVnd, locale)}
              </p>
            ) : (
              <p className="text-sm font-semibold">{copy.labQuote}</p>
            )}
          </div>
          {course.purchaseMode === "checkout" ? (
            <div className="mt-9">
              <AddToCartButton
                priceVnd={course.priceVnd}
                courseSessionId={course.sessionId}
                slug={`course-${course.slug}`}
                title={course.title}
                variantId={course.variantId}
              />
            </div>
          ) : (
            <Link
              href={`${solutionsHref}#tu-van-phong-lab`}
              className="mt-9 inline-flex min-h-11 items-center gap-2 bg-white px-4 text-sm font-semibold text-[#10232A] hover:bg-[#00D1C1]"
            >
              {copy.discussDeployment}
              <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
