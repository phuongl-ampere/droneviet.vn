import { QuoteForm } from "@/components/store/quote-form";
import { storeProducts } from "@/lib/commerce/storefront-catalog";

interface QuotePageProps {
  searchParams?: Promise<{ product?: string }>;
}

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const query = (await searchParams) ?? {};
  const product = storeProducts.find((item) => item.slug === query.product);

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#10232A] sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <section>
          <p className="text-xs font-medium text-[#006D66]">Drone Viet B2B</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">
            Yêu cầu báo giá
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Nhận cấu hình thiết bị, học liệu, triển khai phòng lab và kế hoạch
            đào tạo theo nhu cầu đơn vị.
          </p>
        </section>
        <QuoteForm productName={product?.name ?? ""} />
      </div>
    </main>
  );
}
