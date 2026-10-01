import { ResearchArticleList } from "@/components/research/research-article-list";

export default function ResearchLandingPage() {
  return (
    <main className="min-h-screen bg-[#F7FAFC] px-5 py-10 text-[#10232A] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <ResearchArticleList />
      </div>
    </main>
  );
}
