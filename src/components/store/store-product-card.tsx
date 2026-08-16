import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";
import {
  formatVnd,
  type StoreProduct,
} from "@/lib/commerce/storefront-catalog";

interface StoreProductCardProps {
  product: StoreProduct;
}

const purchaseLabels = {
  checkout: "Thêm vào giỏ",
  preorder: "Đặt trước",
  quote_only: "Yêu cầu báo giá",
} as const;

const stageClasses = {
  aqua: "bg-[#0E2528]",
  graphite: "bg-[#161C20]",
  ice: "bg-[#30464B]",
  sand: "bg-[#42392D]",
} as const;

export function StoreProductCard({ product }: StoreProductCardProps) {
  return (
    <article className="group flex min-h-full flex-col border border-black/10 bg-white">
      <Link
        href={`/san-pham/${product.slug}`}
        aria-label={product.name}
        className={`relative grid aspect-[1.2] place-items-center overflow-hidden p-8 ${stageClasses[product.accent]}`}
      >
        <Image
          src={product.imageSrc}
          alt={`Generic quadcopter flight photo representing ${product.name}`}
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
        />
        <span className="absolute inset-0 bg-[#071117]/30" />
        {product.badge ? (
          <span className="absolute left-4 top-4 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#10232A]">
            {product.badge}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-5 py-6">
        <p className="text-xs font-medium text-slate-500">
          {product.collection === "stem"
            ? "Drone giáo dục"
            : product.collection === "research"
              ? "Drone nghiên cứu"
              : "Thiết bị đào tạo"}
        </p>
        <Link
          href={`/san-pham/${product.slug}`}
          className="mt-2 text-xl font-semibold leading-tight text-[#10232A]"
        >
          {product.name}
        </Link>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
          {product.summary}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-black/10 py-4">
          {product.specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-[10px] font-medium uppercase text-slate-400">
                {spec.label}
              </dt>
              <dd className="mt-1 text-xs font-semibold text-[#172226]">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Từ</p>
            <p className="mt-1 text-lg font-semibold text-[#10232A]">
              {formatVnd(product.priceVnd)}
            </p>
          </div>
          {product.purchaseMode === "checkout" ? (
            <AddToCartButton
              priceVnd={product.priceVnd}
              slug={product.slug}
              title={product.name}
              variantId={product.variantId}
            />
          ) : (
            <Link
              href={
                product.purchaseMode === "quote_only"
                  ? `/bao-gia?product=${product.slug}`
                  : `/san-pham/${product.slug}`
              }
              className="inline-flex min-h-10 items-center gap-2 bg-[#10232A] px-3.5 text-sm font-semibold text-white transition hover:bg-[#006D66]"
            >
              {purchaseLabels[product.purchaseMode]}
              <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
