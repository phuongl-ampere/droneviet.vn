"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { findGuestOrder, resumePayosPayment } from "@/lib/commerce/orders";

export default function TrackOrderPage() {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState<{
    orderNumber?: string;
    paymentMethod?: string;
    status?: string;
    totalVnd?: number;
  } | null>(null);
  const [trackingPhone, setTrackingPhone] = useState("");
  const [resumingPayment, setResumingPayment] = useState(false);
  const [resumeError, setResumeError] = useState("");

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#10232A] sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <section>
          <p className="text-xs font-medium text-[#006D66]">{t("tracking.storeName")}</p>
          <h1 className="mt-3 text-4xl font-semibold">{t("tracking.title")}</h1>
          <p className="mt-5 leading-7 text-slate-600">
            {t("tracking.description")}
          </p>
        </section>
        <form
          className="border border-black/10 bg-white p-5 sm:p-7"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setMessage("");
            setOrder(null);
            setResumeError("");

            try {
              const phone = String(data.get("phone") ?? "");
              const result = (await findGuestOrder(
                String(data.get("orderNumber") ?? ""),
                phone,
              )) as {
                orderNumber: string;
                paymentMethod: string;
                status: string;
                totalVnd: number;
              };
              setOrder(result);
              setTrackingPhone(phone);
            } catch (error) {
              setMessage(
                error instanceof Error &&
                error.message !== "ORDER_NOT_FOUND" &&
                error.message !== "COMMERCE_API_NOT_CONFIGURED"
                  ? error.message
                  : t("tracking.notFound"),
              );
            }
          }}
        >
          <label className="grid gap-2 text-sm font-medium">
            {t("tracking.orderNumber")}
            <input
              required
              name="orderNumber"
              placeholder="DV-XXXXXXXX"
              className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
            />
          </label>
          <label className="mt-5 grid gap-2 text-sm font-medium">
            {t("common.phone")}
            <input
              required
              name="phone"
              inputMode="tel"
              className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
            />
          </label>
          <button
            type="submit"
            className="mt-6 min-h-11 bg-[#10232A] px-4 text-sm font-semibold text-white hover:bg-[#006D66]"
          >
            {t("tracking.lookup")}
          </button>
          {order ? (
            <>
              <dl className="mt-6 border-t border-black/10 pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">{t("tracking.orderNumber")}</dt>
                  <dd className="font-semibold">{order.orderNumber}</dd>
                </div>
                <div className="mt-3 flex justify-between gap-4">
                  <dt className="text-slate-500">{t("tracking.status")}</dt>
                  <dd className="font-semibold">{order.status}</dd>
                </div>
              </dl>
              {order.status === "pending_payment" &&
              order.paymentMethod === "payos" ? (
                <button
                  type="button"
                  disabled={resumingPayment}
                  onClick={() => {
                    if (!order.orderNumber) {
                      return;
                    }

                    setResumingPayment(true);
                    setResumeError("");
                    void resumePayosPayment(order.orderNumber, trackingPhone)
                      .then(({ checkoutUrl }) => {
                        window.location.assign(checkoutUrl);
                      })
                      .catch(() => {
                        setResumeError(t("tracking.resumePaymentError"));
                      })
                      .finally(() => {
                        setResumingPayment(false);
                      });
                  }}
                  className="mt-5 min-h-11 bg-[#10232A] px-4 text-sm font-semibold text-white transition hover:bg-[#006D66] disabled:bg-slate-400"
                >
                  {resumingPayment
                    ? t("tracking.resumingPayment")
                    : t("tracking.resumePayment")}
                </button>
              ) : null}
            </>
          ) : null}
          {resumeError ? (
            <p className="mt-4 border-l-2 border-red-600 pl-3 text-sm text-slate-600">
              {resumeError}
            </p>
          ) : null}
          {message ? (
            <p className="mt-4 border-l-2 border-red-600 pl-3 text-sm text-slate-600">
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </main>
  );
}
