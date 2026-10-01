import type { DroneModel, Service, SiteContent } from "@/lib/content/schema";
import { getTranslations } from "@/lib/i18n";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://droneviet.vn").replace(
  /\/$/,
  "",
);

type BreadcrumbItem = {
  name: string;
  url: string;
};

export function buildAbsoluteUrl(pathname: string): string {
  if (pathname === "") {
    return siteUrl;
  }

  return `${siteUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function getLocalizedAlternates(viPath: string, enPath: string) {
  return {
    vi: buildAbsoluteUrl(viPath),
    en: buildAbsoluteUrl(enPath),
    "x-default": buildAbsoluteUrl(viPath),
  };
}

export function buildOrganizationJsonLd(
  site: SiteContent,
  locale: "vi" | "en" = "vi",
) {
  const copy = getTranslations(locale);

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: site.brand.name,
    url: siteUrl,
    description: site.brand.description,
    sameAs: ["https://zalo.me/0384070636"],
    knowsAbout: [
      copy.structuredData.knowsAboutDroneEducation,
      copy.structuredData.knowsAboutStemKits,
      copy.structuredData.knowsAboutCurriculum,
      copy.structuredData.knowsAboutResearchPlatform,
      copy.structuredData.knowsAboutVisionLab,
    ],
  };
}

export function buildProductJsonLd(drone: DroneModel, locale: "vi" | "en") {
  const copy = getTranslations(locale);
  const path =
    locale === "vi" ? `/san-pham/${drone.slug}` : `/en/products/${drone.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: drone.name,
    url: buildAbsoluteUrl(path),
    description: drone.summary,
    category: copy.structuredData.productCategory,
    brand: {
      "@type": "Brand",
      name: copy.common.brandName,
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: drone.level,
    },
    additionalProperty: drone.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: spec.label,
      value: spec.value,
    })),
  };
}

export function buildServiceJsonLd(service: Service, locale: "vi" | "en") {
  const copy = getTranslations(locale);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    serviceType: copy.structuredData.serviceType,
    areaServed:
      locale === "vi"
        ? copy.structuredData.areaVietnam
        : copy.structuredData.areaInternational,
    provider: {
      "@type": "EducationalOrganization",
      name: copy.common.brandName,
      url: siteUrl,
    },
    audience: service.audience.map((audience) => ({
      "@type": "Audience",
      audienceType: audience,
    })),
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.url),
    })),
  };
}

export function buildFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
