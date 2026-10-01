import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatVnd } from "@/lib/commerce/storefront-catalog";
import { storeCourses } from "@/lib/commerce/courses";

export default function CourseCatalogPage() {
  return (
    <main className="min-h-screen bg-white text-[#10232A]">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-medium text-[#006D66]">
            Drone Viet Learning
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            Khóa học Drone Việt
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Lộ trình từ chuyến bay đầu tiên đến lab nghiên cứu, kết nối thiết
            bị, học liệu và đội ngũ triển khai.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {storeCourses.map((course) => (
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
                  <dt className="text-slate-500">Lộ trình</dt>
                  <dd className="font-semibold">{course.format}</dd>
                </div>
                <div className="mt-2 flex justify-between gap-4">
                  <dt className="text-slate-500">Lịch</dt>
                  <dd className="text-right font-semibold">{course.sessionLabel}</dd>
                </div>
              </dl>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  {course.purchaseMode === "checkout" ? (
                    <>
                      <p className="text-xs text-slate-500">
                        {course.seatsRemaining} chỗ còn lại
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {formatVnd(course.priceVnd)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold">Triển khai theo đơn vị</p>
                  )}
                </div>
                <Link
                  href={`/khoa-hoc/${course.slug}`}
                  className="inline-flex min-h-10 items-center gap-2 bg-[#10232A] px-3 text-sm font-semibold text-white hover:bg-[#006D66]"
                >
                  {course.purchaseMode === "checkout"
                    ? "Đăng ký"
                    : "Xem syllabus"}
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
