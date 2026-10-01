"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useOptionalCustomerSession } from "@/components/customer/customer-session-provider";
import { useI18n } from "@/components/i18n-provider";
import {
  researchApi,
  type ResearchArticle,
  type ResearchComment,
} from "@/lib/content/research-api";

export function ResearchArticleReader({ slug }: { slug: string }) {
  const { locale, t } = useI18n();
  const session = useOptionalCustomerSession();
  const [article, setArticle] = useState<ResearchArticle | null>(null);
  const [comments, setComments] = useState<ResearchComment[]>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      researchApi.getArticle(slug, locale),
      researchApi.listComments(slug),
    ])
      .then(([nextArticle, nextComments]) => {
        if (active) {
          setArticle(nextArticle);
          setComments(nextComments);
        }
      })
      .catch(() => {
        if (active) setError(t("research.loadError"));
      });
    return () => {
      active = false;
    };
  }, [locale, slug, t]);

  if (!article && !error) {
    return <p className="text-sm text-slate-600">{t("research.loading")}</p>;
  }
  if (!article) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const loginHref =
    locale === "vi"
      ? `/dang-nhap?next=/kien-thuc-rd/nghien-cuu-phat-trien/${slug}`
      : `/en/login?next=/en/research/${slug}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <article className="min-w-0 bg-white p-5 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006D66]">
          {t("research.minutes", { count: article.readingTimeMinutes })}
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">
          {article.title}
        </h1>
        {article.summary ? (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {article.summary}
          </p>
        ) : null}
        <div
          className="rich-text-content prose prose-slate mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: article.renderedHtml }}
        />

        <section className="mt-12 border-t border-black/10 pt-8">
          <h2 className="text-xl font-semibold">{t("research.rating")}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("research.ratingCount", { count: article.rating.count })}
          </p>
          {session?.user ? (
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  aria-label={t("research.star", { count: score })}
                  onClick={() =>
                    void researchApi.rateArticle(article.slug, score).then((rating) =>
                      setArticle({ ...article, rating }),
                    )
                  }
                  className={`grid size-9 place-items-center border text-sm font-semibold ${
                    article.rating.mine === score
                      ? "border-[#006D66] bg-[#006D66] text-white"
                      : "border-black/15"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          ) : (
            <Link href={loginHref} className="mt-4 inline-block text-sm font-semibold text-[#006D66]">
              {t("research.signInToEngage")}
            </Link>
          )}
        </section>

        <section className="mt-10 border-t border-black/10 pt-8">
          <h2 className="text-xl font-semibold">{t("research.comments")}</h2>
          {session?.user ? (
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                setError("");
                void researchApi
                  .createComment(article.slug, comment)
                  .then((nextComment) => {
                    setComments((current) => [nextComment, ...current]);
                    setComment("");
                  })
                  .catch(() => setError(t("research.submitError")));
              }}
            >
              <label className="grid gap-2 text-sm font-medium">
                {t("research.comment")}
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={t("research.commentPlaceholder")}
                  rows={4}
                  className="border border-black/15 p-3 font-normal outline-none focus:border-[#006D66]"
                />
              </label>
              <button
                type="submit"
                className="mt-3 min-h-10 bg-[#10232A] px-4 text-sm font-semibold text-white transition hover:bg-[#006D66]"
              >
                {t("research.submitComment")}
              </button>
            </form>
          ) : null}
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <div className="mt-6 grid gap-5">
            {comments.map((item) => (
              <div key={item.id} className="border-l-2 border-[#006D66] pl-4">
                <p className="text-sm leading-6 text-slate-700">{item.body}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {item.author?.displayName ?? ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      </article>

      <aside className="hidden h-fit border-l border-black/10 pl-5 lg:sticky lg:top-20 lg:block">
        <h2 className="text-sm font-semibold">{t("research.contents")}</h2>
        <nav className="mt-4 grid gap-3">
          {article.tableOfContents.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className="text-sm leading-5 text-slate-600 transition hover:text-[#006D66]"
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}
