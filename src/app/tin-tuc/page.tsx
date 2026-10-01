import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/section-shell";
import { getArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tin tức và học liệu",
  description:
    "Bài viết và học liệu về drone cho nghiên cứu, giáo dục, STEM, giáo trình và triển khai phòng lab drone.",
};

export default async function ArticlesPage() {
  const articles = getArticles();

  return (
    <SectionShell
      eyebrow="Knowledge base"
      title="Tin tức và học liệu"
      description="Nội dung được lưu bằng Markdown trong repo để dễ chỉnh sửa trước khi có admin/database."
    >
      <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
        {articles.map((article) => (
          <article key={article.slug} className="group border-t border-[#172226]/16 py-7">
            <Link href={`/tin-tuc/${article.slug}`} className="block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#007F75]">
                <time dateTime={article.date}>{article.date}</time> · {article.category} · {article.readingTime}
              </p>
              <h2 className="display-type mt-5 text-3xl font-medium leading-tight tracking-[-0.025em] text-[#10232A] sm:text-4xl">
                {article.title}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{article.summary}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#006D66]">
                Đọc bài viết
                <ArrowUpRight aria-hidden="true" size={15} />
              </span>
            </Link>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
