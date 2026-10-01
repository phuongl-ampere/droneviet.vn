"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogOut, Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { useCustomerSession } from "@/components/customer/customer-session-provider";
import {
  customerApi,
  type CustomerOrder,
} from "@/lib/commerce/customer-api";
import type { TranslationKey } from "@/lib/i18n";

function formatVnd(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function paymentLabel(
  paymentMethod: string,
  t: (key: TranslationKey) => string,
): string {
  if (paymentMethod === "cod") {
    return t("account.paymentCod");
  }
  if (paymentMethod === "payos") {
    return t("account.paymentPayos");
  }
  if (paymentMethod === "bank_transfer") {
    return t("account.paymentBankTransfer");
  }
  return paymentMethod;
}

function statusKey(status: string): TranslationKey | null {
  const key = `account.status.${status}` as TranslationKey;

  return key.startsWith("account.status.") ? key : null;
}

export function CustomerAccount() {
  const router = useRouter();
  const { error: sessionError, loading, logout, setUser, user } =
    useCustomerSession();
  const { locale, t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: "", phone: "" });
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [ordersError, setOrdersError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumingOrderNumber, setResumingOrderNumber] = useState<string | null>(
    null,
  );
  const [resumePaymentError, setResumePaymentError] = useState("");
  const userId = user?.id;
  const loginHref = locale === "vi" ? "/dang-nhap" : "/en/login";
  const accountHref = locale === "vi" ? "/tai-khoan" : "/en/account";
  const storeHref = locale === "vi" ? "/cua-hang" : "/en/store";

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`${loginHref}?next=${accountHref}`);
    }
  }, [accountHref, loading, loginHref, router, user]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      try {
        const nextOrders = await customerApi.listOwnOrders();

        if (!cancelled) {
          setOrders(nextOrders);
          setOrdersError("");
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
          setOrdersError(t("account.ordersLoadError"));
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [t, userId]);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#F2F4F4] px-5 py-12 text-[#10232A]">
        <div className="mx-auto h-40 max-w-6xl animate-pulse border border-black/10 bg-white" />
      </main>
    );
  }

  const initials = user.displayName?.trim().charAt(0) || user.email.charAt(0);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");
    setSaved(false);
    setSaving(true);

    try {
      const nextUser = await customerApi.updateProfile({
        displayName: form.displayName.trim(),
        phone: form.phone.trim(),
      });
      setUser(nextUser);
      setEditing(false);
      setSaved(true);
    } catch {
      setSaveError(t("account.profileSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace(loginHref);
  }

  async function handleResumePayment(orderNumber: string) {
    setResumePaymentError("");
    setResumingOrderNumber(orderNumber);

    try {
      const { checkoutUrl } = await customerApi.resumePayosPayment(orderNumber);
      window.location.assign(checkoutUrl);
    } catch {
      setResumePaymentError(t("account.resumePaymentError"));
    } finally {
      setResumingOrderNumber(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F4F4] px-5 py-8 text-[#10232A] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-5 border border-[#10232A] bg-[#10232A] p-5 text-white sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-8">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full border border-[#7DE0D7]/50 bg-white/10 text-xl font-semibold text-[#7DE0D7]"
          >
            {initials.toUpperCase()}
          </span>
          <div>
            <p className="text-xs font-semibold text-[#7DE0D7]">
              {t("account.eyebrow")}
            </p>
            <h1 className="mt-1 text-2xl font-semibold">{t("account.title")}</h1>
            <p className="mt-2 text-sm text-slate-300">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            aria-label={t("account.signOut")}
            title={t("account.signOut")}
            className="grid size-11 place-items-center border border-white/20 text-slate-200 transition hover:border-[#7DE0D7] hover:text-[#7DE0D7]"
          >
            <LogOut aria-hidden="true" size={17} />
          </button>
        </section>

        {sessionError ? (
          <p className="mt-5 border-l-2 border-red-600 pl-3 text-sm text-slate-700">
            {t("account.sessionLoadError")}
          </p>
        ) : null}
        {saved ? (
          <p className="mt-5 border-l-2 border-[#006D66] pl-3 text-sm text-[#006D66]">
            {t("account.saved")}
          </p>
        ) : null}

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{t("account.profile")}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t("account.profileDescription")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSaveError("");
                setSaved(false);
                setForm({
                  displayName: user.displayName ?? "",
                  phone: user.phone ?? "",
                });
                setEditing(true);
              }}
              className="inline-flex min-h-11 items-center gap-2 border border-[#10232A] px-4 text-sm font-semibold hover:border-[#006D66] hover:text-[#006D66]"
            >
              <Pencil aria-hidden="true" size={16} />
              {t("account.editProfile")}
            </button>
          </div>

          <div className="mt-5 grid gap-px border border-black/10 bg-black/10 md:grid-cols-2">
            <section className="bg-white p-5 sm:p-6">
              <p className="text-xs font-semibold text-[#006D66]">
                {t("account.verifiedEmail")}
              </p>
              <p className="mt-3 break-all text-base font-semibold">{user.email}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t("account.emailHint")}
              </p>
            </section>
            <section className="bg-white p-5 sm:p-6">
              <p className="text-xs font-semibold text-[#006D66]">
                {t("account.profile")}
              </p>
              <p className="mt-3 text-base font-semibold">
                {user.displayName || user.email}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {user.phone || t("account.noPhone")}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t("account.phoneHint")}
              </p>
            </section>
          </div>
        </section>

        <section className="mt-10 border-t border-black/10 pt-8">
          <h2 className="text-xl font-semibold">{t("account.orderHistory")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("account.ordersDescription")}
          </p>

          {orders === null ? (
            <p className="mt-6 text-sm text-slate-600">{t("account.ordersLoading")}</p>
          ) : null}
        {ordersError ? (
            <p className="mt-6 border-l-2 border-red-600 pl-3 text-sm text-slate-700">
              {ordersError}
            </p>
        ) : null}
        {resumePaymentError ? (
          <p className="mt-5 border-l-2 border-red-600 pl-3 text-sm text-slate-700">
            {resumePaymentError}
          </p>
        ) : null}
          {orders?.length === 0 ? (
            <div className="mt-6 border border-dashed border-black/20 px-5 py-8 sm:px-7">
              <p className="text-sm text-slate-600">{t("account.ordersEmpty")}</p>
              <Link
                href={storeHref}
                className="mt-5 inline-flex min-h-11 items-center border border-[#10232A] px-4 text-sm font-semibold hover:border-[#006D66] hover:text-[#006D66]"
              >
                {t("account.shopNow")}
              </Link>
            </div>
          ) : null}
          {orders?.length ? (
            <div className="mt-6 grid gap-3">
              {orders.map((order) => {
                const key = statusKey(order.status);

                return (
                  <details
                    key={order.id}
                    className="border border-black/10 bg-white"
                  >
                    <summary className="cursor-pointer list-none p-5 sm:p-6">
                      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                        <div>
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {new Intl.DateTimeFormat(t("account.dateLocale"), {
                              dateStyle: "medium",
                            }).format(new Date(order.createdAt))}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-[#006D66]">
                          {key ? t(key) : order.status}
                        </p>
                        <p className="text-base font-semibold">
                          {formatVnd(order.totalVnd, t("account.dateLocale"))}
                        </p>
                      </div>
                    </summary>
                    <div className="border-t border-black/10 px-5 py-5 sm:px-6">
                      <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-slate-500">{t("account.paymentMethod")}</dt>
                          <dd className="mt-1 font-medium">
                            {paymentLabel(order.paymentMethod, t)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">{t("account.items", { count: order.lines.length })}</dt>
                          <dd className="mt-1 font-medium">
                            {order.lines.reduce(
                              (total, line) => total + line.quantity,
                              0,
                            )}
                          </dd>
                        </div>
                      </dl>
                      <ul className="mt-5 divide-y divide-black/10 border-y border-black/10">
                        {order.lines.map((line) => (
                          <li
                            key={line.id}
                            className="flex items-center justify-between gap-4 py-3 text-sm"
                          >
                            <span>
                              {line.title} <span className="text-slate-500">x{line.quantity}</span>
                            </span>
                            <span className="font-medium">
                              {formatVnd(
                                line.unitPriceVnd * line.quantity,
                                t("account.dateLocale"),
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {order.paymentMethod === "payos" &&
                      order.status === "pending_payment" ? (
                        <button
                          type="button"
                          disabled={resumingOrderNumber === order.orderNumber}
                          onClick={() => void handleResumePayment(order.orderNumber)}
                          className="mt-5 min-h-10 bg-[#10232A] px-4 text-sm font-semibold text-white transition hover:bg-[#006D66] disabled:bg-slate-400"
                        >
                          {resumingOrderNumber === order.orderNumber
                            ? t("account.resumingPayment")
                            : t("account.resumePayment")}
                        </button>
                      ) : null}
                    </div>
                  </details>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>

      {editing ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-profile-edit-title"
          className="fixed inset-0 z-50 flex items-end bg-black/45 sm:items-center sm:justify-center"
        >
          <form
            method="post"
            onSubmit={handleSave}
            className="w-full max-w-lg bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#006D66]">
                  {t("account.profile")}
                </p>
                <h2
                  id="customer-profile-edit-title"
                  className="mt-1 text-xl font-semibold"
                >
                  {t("account.editProfileTitle")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label={t("account.close")}
                title={t("account.close")}
                className="grid size-10 place-items-center border border-black/15 text-slate-600 hover:border-[#006D66] hover:text-[#006D66]"
              >
                <X aria-hidden="true" size={17} />
              </button>
            </div>

            <label className="mt-7 grid gap-2 text-sm font-medium">
              {t("common.fullName")}
              <input
                required
                minLength={2}
                value={form.displayName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
                className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
              />
            </label>
            <label className="mt-5 grid gap-2 text-sm font-medium">
              {t("common.phone")}
              <input
                inputMode="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
              />
            </label>
            {saveError ? (
              <p className="mt-5 border-l-2 border-red-600 pl-3 text-sm text-slate-700">
                {saveError}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 bg-[#10232A] px-4 text-sm font-semibold text-white hover:bg-[#006D66] disabled:bg-slate-400"
              >
                {saving ? t("account.saving") : t("account.saveChanges")}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="min-h-11 border border-black/15 px-4 text-sm font-semibold hover:border-[#006D66] hover:text-[#006D66]"
              >
                {t("account.cancel")}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
