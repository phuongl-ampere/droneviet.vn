"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import { useI18n } from "@/components/i18n-provider";

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutResultContent />
    </Suspense>
  );
}

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const orderNumber = searchParams.get("order")?.trim();
  const storeHref = locale === "vi" ? "/cua-hang" : "/en/store";
  const trackingHref = orderNumber
    ? `${locale === "vi" ? "/theo-doi-don" : "/en/order-tracking"}?order=${encodeURIComponent(orderNumber)}`
    : locale === "vi"
      ? "/theo-doi-don"
      : "/en/order-tracking";

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-5 py-12 text-[#10232A] sm:px-8 sm:py-20">
      <section className="mx-auto max-w-2xl border border-black/10 bg-white p-6 sm:p-10">
        <CheckCircle2
          aria-hidden="true"
          className="text-[#006D66]"
          size={34}
        />
        <h1 className="mt-5 text-3xl font-semibold">
          {t("checkout.result.title")}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
          {t("checkout.result.description")}
        </p>
        <div className="mt-7 border-y border-black/10 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {t("tracking.orderNumber")}
          </p>
          <p className="mt-2 text-xl font-semibold">
            {orderNumber || t("checkout.result.missingOrder")}
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={trackingHref}
            className="inline-flex min-h-11 items-center bg-[#10232A] px-4 text-sm font-semibold text-white transition hover:bg-[#006D66]"
          >
            {t("tracking.title")}
          </Link>
          <Link
            href={storeHref}
            className="inline-flex min-h-11 items-center border border-black/15 px-4 text-sm font-semibold transition hover:border-[#006D66] hover:text-[#006D66]"
          >
            {t("checkout.result.returnStore")}
          </Link>
        </div>
      </section>
    </main>
  );
}
