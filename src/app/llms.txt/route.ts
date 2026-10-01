import {
  getArticles,
  getDroneModels,
  getServices,
  getSiteContent,
} from "@/lib/content";
import { getTranslations } from "@/lib/i18n";
import { buildAbsoluteUrl } from "@/lib/seo";

export async function GET() {
  const viSite = getSiteContent("vi");
  const enSite = getSiteContent("en");
  const products = getDroneModels("vi");
  const services = getServices("vi");
  const viArticles = getArticles("vi");
  const enArticles = getArticles("en");
  const viCopy = getTranslations("vi").llms;
  const enCopy = getTranslations("en").llms;

  const lines = [
    viCopy.title,
    "",
    enCopy.summary,
    "",
    `${enCopy.vietnameseHome}: ${buildAbsoluteUrl("/")}`,
    `${enCopy.englishHome}: ${buildAbsoluteUrl("/en")}`,
    `${enCopy.brandSummaryVietnamese}: ${viSite.brand.description}`,
    `${enCopy.brandSummaryEnglish}: ${enSite.brand.description}`,
    "",
    enCopy.coreProducts,
    ...products.map((product) => `- ${product.name}: ${buildAbsoluteUrl(`/san-pham/${product.slug}`)} | ${buildAbsoluteUrl(`/en/products/${product.slug}`)}`),
    "",
    enCopy.serviceTopics,
    ...services.slice(0, 4).map((service) => `- ${service.title}: ${service.summary}`),
    "",
    enCopy.articles,
    ...viArticles.map(
      (article) =>
        `- ${article.title}: ${buildAbsoluteUrl(`/tin-tuc/${article.slug}`)}`,
    ),
    ...enArticles.map(
      (article) =>
        `- ${article.title}: ${buildAbsoluteUrl(`/en/news/${article.slug}`)}`,
    ),
    "",
    enCopy.recommendedCitation,
    enCopy.citation,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
