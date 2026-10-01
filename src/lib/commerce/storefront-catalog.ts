export type StoreCollection =
  | "accessories"
  | "research"
  | "stem"
  | "training";

export type StoreAvailability = "in_stock" | "preorder" | "quote_only";

export type StoreShopCategory = "drone" | "education" | "parts";

export type StorePurchaseMode = "checkout" | "preorder" | "quote_only";

export type StoreLearningStage = "high-school" | "secondary" | "university";

export type StoreProductSlug =
  | "dv-ai-vision"
  | "dv-code-fleet"
  | "dv-instructor-kit"
  | "dv-primary-lab"
  | "dv-research-platform";

export interface StoreProduct {
  slug: StoreProductSlug;
  name: string;
  summary: string;
  collection: StoreCollection;
  availability: StoreAvailability;
  purchaseMode: StorePurchaseMode;
  priceVnd: number;
  variantId: string;
  compareAtVnd?: number;
  badge?: string;
  specs: Array<{ label: string; value: string }>;
  accent: "aqua" | "graphite" | "ice" | "sand";
  imageSrc: string;
  learningStages: StoreLearningStage[];
}

export interface StoreProductFilter {
  availability?: StoreAvailability;
  collection?: StoreCollection;
  learningStage?: StoreLearningStage;
  shopCategory?: StoreShopCategory;
  purchaseMode?: StorePurchaseMode;
  query?: string;
}

type StoreProductSeed = Omit<
  StoreProduct,
  "badge" | "name" | "specs" | "summary"
>;

const storeProductSeeds: StoreProductSeed[] = [
  {
    slug: "dv-primary-lab",
    collection: "stem",
    availability: "in_stock",
    purchaseMode: "checkout",
    priceVnd: 9_500_000,
    variantId: "11111111-1111-4111-8111-111111111111",
    accent: "ice",
    imageSrc: "/store/quadcopter-flight-01.jpg",
    learningStages: ["secondary"],
  },
  {
    slug: "dv-code-fleet",
    collection: "stem",
    availability: "in_stock",
    purchaseMode: "checkout",
    priceVnd: 24_900_000,
    variantId: "22222222-2222-4222-8222-222222222222",
    compareAtVnd: 27_500_000,
    accent: "aqua",
    imageSrc: "/store/quadcopter-flight-02.jpg",
    learningStages: ["secondary"],
  },
  {
    slug: "dv-ai-vision",
    collection: "research",
    availability: "preorder",
    purchaseMode: "preorder",
    priceVnd: 35_900_000,
    variantId: "33333333-3333-4333-8333-333333333333",
    accent: "graphite",
    imageSrc: "/store/quadcopter-flight-03.jpg",
    learningStages: ["high-school", "university"],
  },
  {
    slug: "dv-research-platform",
    collection: "research",
    availability: "quote_only",
    purchaseMode: "quote_only",
    priceVnd: 59_000_000,
    variantId: "44444444-4444-4444-8444-444444444444",
    accent: "sand",
    imageSrc: "/store/quadcopter-flight-01.jpg",
    learningStages: ["university"],
  },
  {
    slug: "dv-instructor-kit",
    collection: "training",
    availability: "in_stock",
    purchaseMode: "checkout",
    priceVnd: 12_800_000,
    variantId: "55555555-5555-4555-8555-555555555555",
    accent: "ice",
    imageSrc: "/store/quadcopter-flight-02.jpg",
    learningStages: ["secondary", "high-school", "university"],
  },
];

export function getStoreProducts(locale: Locale = "vi"): StoreProduct[] {
  const products = getTranslations(locale).catalog.products;

  return storeProductSeeds.map((product) => {
    const copy = products[product.slug];

    return {
      ...product,
      badge: copy.badge || undefined,
      name: copy.name,
      specs: [
        { label: copy.specOneLabel, value: copy.specOneValue },
        { label: copy.specTwoLabel, value: copy.specTwoValue },
      ],
      summary: copy.summary,
    };
  });
}

export const storeProducts = getStoreProducts();

export function filterStoreProducts(
  products: StoreProduct[],
  filter: StoreProductFilter,
): StoreProduct[] {
  return products.filter((product) => {
    if (
      filter.shopCategory &&
      !matchesShopCategory(product, filter.shopCategory)
    ) {
      return false;
    }

    if (filter.collection && product.collection !== filter.collection) {
      return false;
    }

    if (
      filter.learningStage &&
      !product.learningStages.includes(filter.learningStage)
    ) {
      return false;
    }

    if (filter.availability && product.availability !== filter.availability) {
      return false;
    }

    if (filter.purchaseMode && product.purchaseMode !== filter.purchaseMode) {
      return false;
    }

    const query = filter.query?.trim().toLocaleLowerCase();
    if (
      query &&
      ![
        product.name,
        product.summary,
        ...product.specs.flatMap((spec) => [spec.label, spec.value]),
      ].some((value) => value.toLocaleLowerCase().includes(query))
    ) {
      return false;
    }

    return true;
  });
}

export function matchesShopCategory(
  product: StoreProduct,
  category: StoreShopCategory,
): boolean {
  if (category === "education") {
    return product.collection === "stem" || product.collection === "training";
  }

  if (category === "parts") {
    return product.collection === "accessories";
  }

  return product.collection === "research";
}

export function formatVnd(value: number, locale: Locale = "vi"): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    currency: "VND",
    style: "currency",
    maximumFractionDigits: 0,
  }).format(value);
}
import type { Locale } from "@/lib/content";
import { getTranslations } from "@/lib/i18n";
