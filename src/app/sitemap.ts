import type { MetadataRoute } from "next";
import { getDroneModels } from "@/lib/content";
import { buildAbsoluteUrl } from "@/lib/seo";

const staticRoutePairs = [
  ["/", "/en", 1],
  ["/san-pham", "/en/products", 0.9],
  ["/giao-trinh", "/en/curriculum", 0.85],
  ["/dich-vu", "/en/services", 0.9],
  ["/tin-tuc", "/en/news", 0.7],
] as const;

const articleRoutePairs = [
  ["/tin-tuc/drone-giao-duc-stem", "/en/news/drone-stem-research", 0.72],
  ["/tin-tuc/giao-trinh-drone-theo-cap-hoc", "/en/news/drone-curriculum-levels", 0.72],
] as const;

function localizedEntry(viPath: string, enPath: string, priority: number) {
  return [
    {
      url: buildAbsoluteUrl(viPath),
      lastModified: new Date("2026-07-05"),
      changeFrequency: "weekly" as const,
      priority,
      alternates: {
        languages: {
          vi: buildAbsoluteUrl(viPath),
          en: buildAbsoluteUrl(enPath),
          "x-default": buildAbsoluteUrl(viPath),
        },
      },
    },
    {
      url: buildAbsoluteUrl(enPath),
      lastModified: new Date("2026-07-05"),
      changeFrequency: "weekly" as const,
      priority,
      alternates: {
        languages: {
          vi: buildAbsoluteUrl(viPath),
          en: buildAbsoluteUrl(enPath),
          "x-default": buildAbsoluteUrl(viPath),
        },
      },
    },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutePairs.flatMap(([viPath, enPath, priority]) =>
    localizedEntry(viPath, enPath, priority),
  );
  const productEntries = getDroneModels("vi").flatMap((drone) =>
    localizedEntry(`/san-pham/${drone.slug}`, `/en/products/${drone.slug}`, 0.82),
  );
  const articleEntries = articleRoutePairs.flatMap(([viPath, enPath, priority]) =>
    localizedEntry(viPath, enPath, priority),
  );

  return [...staticEntries, ...productEntries, ...articleEntries];
}
