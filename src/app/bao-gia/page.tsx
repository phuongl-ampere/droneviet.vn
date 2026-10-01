import { QuoteForm } from "@/components/store/quote-form";
import { getStoreProducts } from "@/lib/commerce/storefront-catalog";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/content";

export interface QuotePageProps {
  locale?: Locale;
  searchParams?: Promise<{ product?: string }>;
}

export default async function QuotePage({
  locale = "vi",
  searchParams,
}: QuotePageProps) {
  const copy = getTranslations(locale).quote;
  const query = (await searchParams) ?? {};
  const product = getStoreProducts(locale).find((item) => item.slug === query.product);

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#10232A] sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <section>
          <p className="text-xs font-medium text-[#006D66]">{copy.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            {copy.description}
          </p>
        </section>
        <QuoteForm productName={product?.name ?? ""} />
      </div>
    </main>
  );
}
