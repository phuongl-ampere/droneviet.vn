"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

interface AddToCartButtonProps {
  priceVnd: number;
  courseSessionId?: string;
  slug: string;
  title: string;
  variantId?: string;
}

export function AddToCartButton({
  priceVnd,
  courseSessionId,
  slug,
  title,
  variantId,
}: AddToCartButtonProps) {
  const { addLine } = useCart();

  return (
    <button
      type="button"
      onClick={() =>
        addLine({
          priceVnd,
          courseSessionId,
          quantity: 1,
          slug,
          title,
          variantId,
        })
      }
      className="inline-flex min-h-10 items-center gap-2 bg-[#10232A] px-3.5 text-sm font-semibold text-white transition hover:bg-[#006D66]"
    >
      <ShoppingBag aria-hidden="true" size={15} />
      Thêm vào giỏ
    </button>
  );
}
