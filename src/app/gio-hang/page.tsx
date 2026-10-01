"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCustomerSession } from "@/components/customer/customer-session-provider";
import { useI18n } from "@/components/i18n-provider";
import { useCart } from "@/components/store/cart-provider";
import { formatVnd } from "@/lib/commerce/storefront-catalog";

export default function CartPage() {
  const router = useRouter();
  const { lineCount, lines, removeLine, totalVnd } = useCart();
  const { locale, t } = useI18n();
  const { loading, user } = useCustomerSession();
  const storeHref = locale === "vi" ? "/cua-hang" : "/en/store";
  const checkoutHref = locale === "vi" ? "/thanh-toan" : "/en/checkout";
  const loginHref = locale === "vi" ? "/dang-nhap" : "/en/login";

  function handleCheckout() {
    if (loading) {
      return;
    }

    router.push(
      user
        ? checkoutHref
        : `${loginHref}?next=${encodeURIComponent(checkoutHref)}`,
    );
  }

  if (lines.length === 0) {
    return (
      <main className="min-h-screen bg-white px-5 py-20 text-[#10232A] sm:px-8">
        <div className="mx-auto max-w-3xl border-t border-black/15 pt-6">
          <h1 className="text-3xl font-semibold">{t("cart.title")}</h1>
          <p className="mt-5 text-slate-600">{t("cart.empty")}</p>
          <Link
            href={storeHref}
            className="mt-7 inline-flex min-h-11 items-center bg-[#10232A] px-4 text-sm font-semibold text-white hover:bg-[#006D66]"
          >
            {t("cart.browse")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#10232A] sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section>
          <div className="flex items-baseline justify-between border-b border-black/15 pb-5">
            <h1 className="text-3xl font-semibold">{t("cart.title")}</h1>
            <p className="text-sm text-slate-600">
              {t("cart.productCount", { count: lineCount })}
            </p>
          </div>
          <ul className="divide-y divide-black/10 bg-white">
            {lines.map((line) => (
              <li
                key={line.slug}
                className="flex items-center justify-between gap-5 p-5"
              >
                <div>
                  <p className="font-semibold">{line.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {line.quantity} x {formatVnd(line.priceVnd)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">
                    {formatVnd(line.priceVnd * line.quantity)}
                  </p>
                  <button
                    type="button"
                    aria-label={t("cart.remove", { title: line.title })}
                    onClick={() => removeLine(line.slug)}
                    className="grid size-10 place-items-center border border-black/15 text-slate-600 hover:border-red-600 hover:text-red-600"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <aside className="h-fit border border-black/10 bg-white p-5">
          <p className="text-sm font-semibold">{t("cart.summary")}</p>
          <div className="mt-5 flex justify-between border-t border-black/10 pt-4">
            <span className="text-sm text-slate-600">{t("cart.subtotal")}</span>
            <span className="font-semibold">{formatVnd(totalVnd)}</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {t("cart.summaryNote")}
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={handleCheckout}
            className="mt-6 flex min-h-11 w-full items-center justify-center bg-[#10232A] px-4 text-sm font-semibold text-white hover:bg-[#006D66] disabled:bg-slate-400"
          >
            {t("cart.checkout")}
          </button>
        </aside>
      </div>
    </main>
  );
}
