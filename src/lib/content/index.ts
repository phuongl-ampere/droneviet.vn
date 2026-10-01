import { articlesEn, articlesVi } from "@/content/data/articles";
import { sourceContentEn, sourceContentVi } from "@/content/data/site";
import {
  articleFrontmatterSchema,
  sourceContentSchema,
  type Article,
  type ArticleSummary,
  type CurriculumItem,
  type DroneModel,
  type Partner,
  type Service,
  type SiteContent,
} from "./schema";

export type Locale = "vi" | "en";

const contentByLocale = {
  vi: sourceContentSchema.parse(sourceContentVi),
  en: sourceContentSchema.parse(sourceContentEn),
};

const articlesByLocale: Record<Locale, Article[]> = {
  vi: articlesVi,
  en: articlesEn,
};

export function getSiteContent(locale: Locale = "vi"): SiteContent {
  return contentByLocale[locale].site;
}

export function getDroneModels(locale: Locale = "vi"): DroneModel[] {
  return contentByLocale[locale].drones;
}

export function getCurriculumItems(locale: Locale = "vi"): CurriculumItem[] {
  return contentByLocale[locale].curriculum;
}

export function getServices(locale: Locale = "vi"): Service[] {
  return contentByLocale[locale].services;
}

export function getPartners(locale: Locale = "vi"): Partner[] {
  return contentByLocale[locale].partners;
}

export function getArticles(locale: Locale = "vi"): ArticleSummary[] {
  return articlesByLocale[locale]
    .sort((first, second) => second.date.localeCompare(first.date))
    .map((article) => articleFrontmatterSchema.parse(article));
}

export function getArticleBySlug(slug: string, locale: Locale = "vi"): Article | null {
  return articlesByLocale[locale].find((article) => article.slug === slug) ?? null;
}
