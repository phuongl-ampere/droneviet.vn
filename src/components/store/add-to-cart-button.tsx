"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
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
  const { t } = useI18n();
  const [wasAdded, setWasAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addLine({
          priceVnd,
          courseSessionId,
          quantity: 1,
          slug,
          title,
          variantId,
        });
        setWasAdded(true);
      }}
      className="inline-flex min-h-10 items-center gap-2 bg-[#10232A] px-3.5 text-sm font-semibold text-white transition hover:bg-[#006D66]"
    >
      <ShoppingBag aria-hidden="true" size={15} />
      {wasAdded ? t("store.addedToCart") : t("store.addToCart")}
    </button>
  );
}
