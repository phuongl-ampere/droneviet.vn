import type { Locale } from "@/lib/content";
import { getTranslations } from "@/lib/i18n";

export type CoursePurchaseMode = "checkout" | "quote_only";

export type StoreCourseSlug =
  | "drone-nhap-mon-cap-1"
  | "drone-ung-dung-dai-hoc"
  | "du-an-drone-cap-3"
  | "lap-trinh-drone-cap-2"
  | "phuong-phap-nghien-cuu-voi-drone";

export interface StoreCourse {
  format: string;
  level: string;
  priceVnd: number;
  purchaseMode: CoursePurchaseMode;
  sessionId?: string;
  variantId?: string;
  seatsRemaining?: number;
  sessionLabel: string;
  slug: StoreCourseSlug;
  summary: string;
  title: string;
}

type StoreCourseSeed = Omit<
  StoreCourse,
  "format" | "level" | "sessionLabel" | "summary" | "title"
>;

const storeCourseSeeds: StoreCourseSeed[] = [
  {
    priceVnd: 2_400_000,
    purchaseMode: "checkout",
    variantId: "66666666-6666-4666-8666-666666666666",
    seatsRemaining: 8,
    sessionId: "99999999-9999-4999-8999-999999999999",
    slug: "drone-nhap-mon-cap-1",
  },
  {
    priceVnd: 3_600_000,
    purchaseMode: "checkout",
    variantId: "77777777-7777-4777-8777-777777777777",
    seatsRemaining: 5,
    sessionId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    slug: "lap-trinh-drone-cap-2",
  },
  {
    priceVnd: 5_200_000,
    purchaseMode: "checkout",
    variantId: "88888888-8888-4888-8888-888888888888",
    seatsRemaining: 10,
    sessionId: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
    slug: "du-an-drone-cap-3",
  },
  {
    priceVnd: 0,
    purchaseMode: "quote_only",
    slug: "drone-ung-dung-dai-hoc",
  },
  {
    priceVnd: 0,
    purchaseMode: "quote_only",
    slug: "phuong-phap-nghien-cuu-voi-drone",
  },
];

export function getStoreCourses(locale: Locale = "vi"): StoreCourse[] {
  const courses = getTranslations(locale).catalog.courses;

  return storeCourseSeeds.map((course) => ({
    ...course,
    ...courses[course.slug],
  }));
}

export const storeCourses = getStoreCourses();
