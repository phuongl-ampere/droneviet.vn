import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { DroneHeroCarousel } from "@/components/drone-hero-carousel";
import { StoreProductCard } from "@/components/store/store-product-card";
import {
  filterStoreProducts,
  getStoreProducts,
  type StoreCollection,
  type StoreLearningStage,
  type StoreShopCategory,
} from "@/lib/commerce/storefront-catalog";
import { getTranslations, translate } from "@/lib/i18n";
import type { Locale } from "@/lib/content";

export interface StorePageProps {
  locale?: Locale;
  searchParams?: Promise<{
    collection?: StoreCollection;
    category?: StoreShopCategory;
    learningStage?: StoreLearningStage;
    q?: string;
  }>;
}

function filterHref(
  next: Partial<{
    collection: StoreCollection;
    category: StoreShopCategory;
    learningStage: StoreLearningStage;
    q: string;
  }>,
  locale: Locale,
) {
  const params = new URLSearchParams();

  if (next.category) {
    params.set("category", next.category);
  }

  if (next.learningStage) {
    params.set("learningStage", next.learningStage);
  }

  if (next.q) {
    params.set("q", next.q);
  }

  const query = params.toString();
  const storeHref = locale === "vi" ? "/cua-hang" : "/en/store";

  return query ? `${storeHref}?${query}` : storeHref;
}

export default async function StorePage({
  locale = "vi",
  searchParams,
}: StorePageProps) {
  const copy = getTranslations(locale).store;
  const filters = (await searchParams) ?? {};
  const products = filterStoreProducts(getStoreProducts(locale), {
    collection: filters.collection,
    learningStage: filters.learningStage,
    query: filters.q,
    shopCategory: filters.category,
  });

  const categories: Array<{
    label: string;
    query: Partial<{
      category: StoreShopCategory;
      learningStage: StoreLearningStage;
    }>;
  }> = [
    { label: copy.allProducts, query: {} },
    { label: copy.gradeTwo, query: { learningStage: "secondary" } },
    { label: copy.gradeThree, query: { learningStage: "high-school" } },
    {
      label: copy.universityResearch,
      query: { learningStage: "university" },
    },
    { label: copy.navParts, query: { category: "parts" } },
    { label: copy.navEducation, query: { category: "education" } },
  ];

  return (
    <main className="min-h-screen bg-white text-[#10232A]">
      <DroneHeroCarousel
        eyebrow={copy.storeName}
        title={copy.heroTitle}
        description={copy.heroDescription}
        variant="compact"
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside
          data-testid="store-category-sidebar"
          className="sticky top-14 hidden self-start lg:block"
        >
          <div className="border-t border-black/15 pt-4">
            <p className="text-sm font-semibold">{copy.catalog}</p>
            <nav className="mt-3 space-y-1" aria-label={copy.catalog}>
              {categories.map((item) => (
                <Link
                  key={item.label}
                  href={filterHref({
                    ...item.query,
                    q: filters.q,
                  }, locale)}
                  className={`block py-2 text-sm ${
                    filters.learningStage === item.query.learningStage &&
                    filters.category === item.query.category
                      ? "font-semibold text-[#10232A]"
                      : "text-slate-600 hover:text-[#006D66]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <p className="text-sm text-slate-600">
              {translate(locale, "store.deviceCount", { count: products.length })}
            </p>
            <details className="relative lg:hidden">
              <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 border border-black/15 px-3 text-sm font-semibold">
                <SlidersHorizontal aria-hidden="true" size={16} />
                {copy.filter}
              </summary>
              <div className="absolute right-0 top-12 z-10 w-64 border border-black/15 bg-white p-4 shadow-xl">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {copy.catalog}
                </p>
                <div className="mt-2 grid gap-1">
                  {categories.map((item) => (
                    <Link
                      key={item.label}
                      href={filterHref({
                        ...item.query,
                        q: filters.q,
                      }, locale)}
                      className="py-2 text-sm text-slate-700"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </details>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <StoreProductCard
                key={product.slug}
                locale={locale}
                product={product}
              />
            ))}
          </div>
          <p className="mt-8 text-xs leading-5 text-slate-500">
            {copy.photoCredit}{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              CC BY-SA 3.0
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
