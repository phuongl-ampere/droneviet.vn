import type { Locale } from "@/lib/content";
import { getTranslations } from "@/lib/i18n";

export type DronePillar = {
  description: string;
  eyebrow: string;
  href: string;
  image: string;
  items: Array<{
    description: string;
    href: string;
    slug: string;
    title: string;
  }>;
  slug: string;
  title: string;
};

type PillarCopy = Omit<DronePillar, "href" | "image" | "items" | "slug"> & {
  items: Record<string, Pick<DronePillar["items"][number], "description" | "title">>;
};

const shopHref = (category: string) => `/cua-hang?category=${category}`;

function localizedItemHref(
  locale: Locale,
  pillarSlug: string,
  itemSlug: string,
  href: string,
): string {
  if (locale === "vi") {
    return href;
  }

  if (pillarSlug === "cua-hang") {
    if (itemSlug === "drone") {
      return "/en/store?category=drone";
    }
    if (itemSlug === "phu-kien-linh-kien") {
      return "/en/store?category=parts";
    }
    return "/en/store?category=education";
  }

  if (itemSlug === "tin-tuc-drone") {
    return "/en/news";
  }

  return `/en/topics/${pillarSlug}/${itemSlug}`;
}

const pillarRoutes = [
  {
    slug: "dao-tao-chung-chi",
    href: "/dao-tao-chung-chi",
    image: "/store/quadcopter-flight-01.jpg",
    items: [
      {
        slug: "chung-chi-lai-drone",
        href: "/dao-tao-chung-chi/chung-chi-lai-drone",
      },
      {
        slug: "lo-trinh-ca-nhan-doanh-nghiep",
        href: "/dao-tao-chung-chi/lo-trinh-ca-nhan-doanh-nghiep",
      },
      {
        slug: "dao-tao-an-toan-bay",
        href: "/dao-tao-chung-chi/dao-tao-an-toan-bay",
      },
      {
        slug: "dang-ky-khoa-hoc",
        href: "/dao-tao-chung-chi/dang-ky-khoa-hoc",
      },
    ],
  },
  {
    slug: "drone-giao-duc",
    href: "/drone-giao-duc",
    image: "/store/quadcopter-flight-02.jpg",
    items: [
      { slug: "cap-2", href: "/drone-giao-duc/cap-2" },
      { slug: "cap-3", href: "/drone-giao-duc/cap-3" },
      {
        slug: "sinh-vien-dai-hoc",
        href: "/drone-giao-duc/sinh-vien-dai-hoc",
      },
      {
        slug: "giao-trinh-drone",
        href: "/drone-giao-duc/giao-trinh-drone",
      },
      { slug: "thiet-bi-lab", href: "/drone-giao-duc/thiet-bi-lab" },
      {
        slug: "dao-tao-giao-vien",
        href: "/drone-giao-duc/dao-tao-giao-vien",
      },
    ],
  },
  {
    slug: "cua-hang",
    href: "/cua-hang",
    image: "/store/quadcopter-flight-03.jpg",
    items: [
      { slug: "drone", href: shopHref("drone") },
      { slug: "phu-kien-linh-kien", href: shopHref("parts") },
      {
        slug: "drone-giao-duc-combo-lab",
        href: shopHref("education"),
      },
    ],
  },
  {
    slug: "bay-hop-phap",
    href: "/bay-hop-phap",
    image: "/store/quadcopter-flight-01.jpg",
    items: [
      {
        slug: "xin-cap-phep-bay",
        href: "/bay-hop-phap/xin-cap-phep-bay",
      },
      {
        slug: "quy-dinh-phap-ly",
        href: "/bay-hop-phap/quy-dinh-phap-ly",
      },
      { slug: "ban-do-cam-bay", href: "/bay-hop-phap/ban-do-cam-bay" },
    ],
  },
  {
    slug: "dich-vu-su-kien",
    href: "/dich-vu-su-kien",
    image: "/store/quadcopter-flight-02.jpg",
    items: [
      {
        slug: "event-trai-nghiem",
        href: "/dich-vu-su-kien/event-trai-nghiem",
      },
      {
        slug: "workshop-truong-hoc",
        href: "/dich-vu-su-kien/workshop-truong-hoc",
      },
      { slug: "demo-lab", href: "/dich-vu-su-kien/demo-lab" },
      {
        slug: "tu-van-trien-khai",
        href: "/dich-vu-su-kien/tu-van-trien-khai",
      },
      { slug: "tin-tuc-drone", href: "/tin-tuc" },
    ],
  },
  {
    slug: "kien-thuc-rd",
    href: "/kien-thuc-rd",
    image: "/store/quadcopter-flight-03.jpg",
    items: [
      {
        slug: "nghien-cuu-phat-trien",
        href: "/kien-thuc-rd/nghien-cuu-phat-trien",
      },
      {
        slug: "bao-cao-quy-chuan",
        href: "/kien-thuc-rd/bao-cao-quy-chuan",
      },
    ],
  },
] as const;

export function getDronePillars(locale: Locale = "vi"): DronePillar[] {
  const copies = getTranslations(locale).pillars as Record<string, PillarCopy>;

  return pillarRoutes.map((pillar) => {
    const copy = copies[pillar.slug];

    return {
      description: copy.description,
      eyebrow: copy.eyebrow,
      href:
        locale === "vi"
          ? pillar.href
          : pillar.slug === "cua-hang"
            ? "/en/store"
            : `/en/topics/${pillar.slug}`,
      image: pillar.image,
      items: pillar.items.map((item) => ({
        description: copy.items[item.slug].description,
        href: localizedItemHref(locale, pillar.slug, item.slug, item.href),
        slug: item.slug,
        title: copy.items[item.slug].title,
      })),
      slug: pillar.slug,
      title: copy.title,
    };
  });
}

export const dronePillars = getDronePillars();

export function getDronePillar(slug: string, locale: Locale = "vi") {
  return getDronePillars(locale).find((pillar) => pillar.slug === slug);
}

export function getDronePillarItem(
  pillarSlug: string,
  itemSlug: string,
  locale: Locale = "vi",
) {
  return getDronePillar(pillarSlug, locale)?.items.find(
    (item) => item.slug === itemSlug,
  );
}
