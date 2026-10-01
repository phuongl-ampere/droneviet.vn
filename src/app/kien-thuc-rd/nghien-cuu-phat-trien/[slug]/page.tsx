import { ResearchArticleReader } from "@/components/research/research-article-reader";

export default async function ResearchArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-5 py-10 text-[#10232A] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <ResearchArticleReader slug={slug} />
      </div>
    </main>
  );
}
