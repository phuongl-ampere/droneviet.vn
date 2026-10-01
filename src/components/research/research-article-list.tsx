"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import {
  researchApi,
  type ResearchArticle,
} from "@/lib/content/research-api";

export function ResearchArticleList() {
  const { locale, t } = useI18n();
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void researchApi
      .listArticles({ locale })
      .then((result) => {
        if (active) setArticles(result.items);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale]);

  if (loading) {
    return <p className="text-sm text-slate-600">{t("research.loading")}</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600">{t("research.loadError")}</p>;
  }
  if (!articles.length) {
    return <p className="text-sm text-slate-600">{t("research.empty")}</p>;
  }

  return (
    <div className="grid gap-px border border-black/10 bg-black/10 md:grid-cols-2">
      {articles.map((article) => {
        const href =
          locale === "vi"
            ? `/kien-thuc-rd/nghien-cuu-phat-trien/${article.slug}`
            : `/en/research/${article.slug}`;

        return (
          <article key={article.slug} className="bg-white p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006D66]">
              {t("research.minutes", { count: article.readingTimeMinutes })}
            </p>
            <h2 className="mt-4 text-xl font-semibold">{article.title}</h2>
            {article.summary ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {article.summary}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-black/10 px-2 py-1 text-xs text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href={href}
              className="mt-7 inline-flex min-h-10 items-center border-b border-[#006D66] text-sm font-semibold text-[#006D66] transition hover:border-[#10232A] hover:text-[#10232A]"
            >
              {t("research.readMore")}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
