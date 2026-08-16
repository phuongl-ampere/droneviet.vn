import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { StoreProductCard } from "@/components/store/store-product-card";
import {
  filterStoreProducts,
  storeProducts,
  type StoreAvailability,
  type StoreCollection,
  type StoreShopCategory,
} from "@/lib/commerce/storefront-catalog";

interface StorePageProps {
  searchParams?: Promise<{
    availability?: StoreAvailability;
    collection?: StoreCollection;
    category?: StoreShopCategory;
    q?: string;
  }>;
}

const shopCategories: Array<{ label: string; value: StoreShopCategory }> = [
  { label: "Drone", value: "drone" },
  { label: "Phụ kiện & Linh kiện", value: "parts" },
  { label: "Drone giáo dục & Combo classroom/lab", value: "education" },
];

const availability: Array<{ label: string; value: StoreAvailability }> = [
  { label: "Còn hàng", value: "in_stock" },
  { label: "Đặt trước", value: "preorder" },
  { label: "Báo giá lab", value: "quote_only" },
];

function filterHref(
  next: Partial<{
    availability: StoreAvailability;
    collection: StoreCollection;
    category: StoreShopCategory;
    q: string;
  }>,
) {
  const params = new URLSearchParams();

  if (next.category) {
    params.set("category", next.category);
  }

  if (next.availability) {
    params.set("availability", next.availability);
  }

  if (next.q) {
    params.set("q", next.q);
  }

  const query = params.toString();
  return query ? `/cua-hang?${query}` : "/cua-hang";
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const filters = (await searchParams) ?? {};
  const products = filterStoreProducts(storeProducts, {
    ...filters,
    query: filters.q,
  });

  return (
    <main className="min-h-screen bg-[#F6F7F7] text-[#10232A]">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-medium text-[#006D66]">Drone Viet Store</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            Cửa hàng Drone Việt
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Thiết bị drone, kit phòng lab và khóa học được cấu hình cho từng
            giai đoạn học tập và nghiên cứu.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="border-t border-black/15 pt-4">
            <p className="text-sm font-semibold">Danh mục</p>
            <nav className="mt-3 space-y-1" aria-label="Danh mục cửa hàng">
              <Link
                href={filterHref({
                  availability: filters.availability,
                  q: filters.q,
                })}
                className="block py-2 text-sm text-slate-600 hover:text-[#006D66]"
              >
                Tất cả thiết bị
              </Link>
              {shopCategories.map((category) => (
                <Link
                  key={category.value}
                  href={filterHref({
                    availability: filters.availability,
                    category: category.value,
                    q: filters.q,
                  })}
                  className={`block py-2 text-sm ${
                    filters.category === category.value
                      ? "font-semibold text-[#10232A]"
                      : "text-slate-600 hover:text-[#006D66]"
                  }`}
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-8 border-t border-black/15 pt-4">
            <p className="text-sm font-semibold">Tình trạng</p>
            <nav className="mt-3 space-y-1" aria-label="Tình trạng sản phẩm">
              {availability.map((item) => (
                <Link
                  key={item.value}
                  href={filterHref({
                    category: filters.category,
                    availability: item.value,
                    q: filters.q,
                  })}
                  className={`block py-2 text-sm ${
                    filters.availability === item.value
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
              {products.length} thiết bị
            </p>
            <details className="relative lg:hidden">
              <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 border border-black/15 px-3 text-sm font-semibold">
                <SlidersHorizontal aria-hidden="true" size={16} />
                Bộ lọc
              </summary>
              <div className="absolute right-0 top-12 z-10 w-64 border border-black/15 bg-white p-4 shadow-xl">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Danh mục
                </p>
                <div className="mt-2 grid gap-1">
                  {shopCategories.map((category) => (
                    <Link
                      key={category.value}
                      href={filterHref({
                        availability: filters.availability,
                        category: category.value,
                        q: filters.q,
                      })}
                      className="py-2 text-sm text-slate-700"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
                <p className="mt-4 border-t border-black/10 pt-4 text-xs font-semibold uppercase text-slate-500">
                  Tình trạng
                </p>
                <div className="mt-2 grid gap-1">
                  {availability.map((item) => (
                    <Link
                      key={item.value}
                      href={filterHref({
                        availability: item.value,
                        category: filters.category,
                        q: filters.q,
                      })}
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
              <StoreProductCard key={product.slug} product={product} />
            ))}
          </div>
          <p className="mt-8 text-xs leading-5 text-slate-500">
            Ảnh drone: Igor Savin,{" "}
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
