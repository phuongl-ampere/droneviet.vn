import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownDocument } from "@/components/content/markdown-document";
import { SectionShell } from "@/components/section-shell";
import { getArticleBySlug, getArticles } from "@/lib/content";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getArticles().map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Không tìm thấy bài viết",
    };
  }

  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <SectionShell
      eyebrow={`${article.category} · ${article.readingTime}`}
      title={article.title}
      description={article.summary}
    >
      <article className="max-w-3xl border-t border-[#172226]/16 bg-white/60 p-6 shadow-[0_24px_80px_rgba(16,35,42,0.05)] sm:p-10">
        <time
          dateTime={article.date}
          className="mb-9 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#007F75]"
        >
          {article.date}
        </time>
        <MarkdownDocument content={article.content} />
      </article>
    </SectionShell>
  );
}
