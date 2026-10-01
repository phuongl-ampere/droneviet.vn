import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatVnd } from "@/lib/commerce/storefront-catalog";
import { getStoreCourses } from "@/lib/commerce/courses";
import { getTranslations, translate } from "@/lib/i18n";
import type { Locale } from "@/lib/content";

export default function CourseCatalogPage({
  locale = "vi",
}: {
  locale?: Locale;
}) {
  const copy = getTranslations(locale).course;
  const courseHref = locale === "vi" ? "/khoa-hoc" : "/en/courses";

  return (
    <main className="min-h-screen bg-white text-[#10232A]">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-medium text-[#006D66]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            {copy.description}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {getStoreCourses(locale).map((course) => (
            <article
              key={course.slug}
              className="flex min-h-full flex-col border border-black/10 bg-white p-5"
            >
              <p className="text-xs font-medium text-[#006D66]">
                {course.level}
              </p>
              <h2 className="mt-3 text-xl font-semibold leading-tight">
                {course.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                {course.summary}
              </p>
              <dl className="mt-6 border-y border-black/10 py-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">{copy.path}</dt>
                  <dd className="font-semibold">{course.format}</dd>
                </div>
                <div className="mt-2 flex justify-between gap-4">
                  <dt className="text-slate-500">{copy.schedule}</dt>
                  <dd className="text-right font-semibold">{course.sessionLabel}</dd>
                </div>
              </dl>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  {course.purchaseMode === "checkout" ? (
                    <>
                      <p className="text-xs text-slate-500">
                        {translate(locale, "course.seatsRemaining", {
                          count: course.seatsRemaining ?? 0,
                        })}
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {formatVnd(course.priceVnd, locale)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold">
                      {copy.organizationDeployment}
                    </p>
                  )}
                </div>
                <Link
                  href={`${courseHref}/${course.slug}`}
                  className="inline-flex min-h-10 items-center gap-2 bg-[#10232A] px-3 text-sm font-semibold text-white hover:bg-[#006D66]"
                >
                  {course.purchaseMode === "checkout"
                    ? copy.register
                    : copy.viewSyllabus}
                  <ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
