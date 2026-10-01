"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ListOrdered,
  Package,
  Plus,
  Save,
  Settings2,
} from "lucide-react";
import { ArticleStudio } from "@/components/admin/article-studio/article-studio";
import { useI18n } from "@/components/i18n-provider";
import {
  createAdminProduct,
  listAdminOrders,
  publishAdminProduct,
  publishAdminProductContent,
  transitionAdminOrder,
  type AdminOrder,
  type AdminOrderStatus,
} from "@/lib/commerce/admin-api";
import type { TranslationKey } from "@/lib/i18n";

type AdminTab = "articles" | "orders" | "products";

type Translate = (
  key: TranslationKey,
  variables?: Record<string, string | number>,
) => string;

function getOrderStatusLabels(
  t: Translate,
): Record<AdminOrderStatus, string> {
  return {
    cancelled: t("admin.statusCancelled"),
    delivered: t("admin.statusDelivered"),
    packing: t("admin.statusPacking"),
    paid: t("admin.statusPaid"),
    payment_failed: t("admin.statusPaymentFailed"),
    pending_payment: t("admin.statusPendingPayment"),
    refund_requested: t("admin.statusRefundRequested"),
    refunded: t("admin.statusRefunded"),
    shipped: t("admin.statusShipped"),
  };
}

const orderTransitions: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  cancelled: [],
  delivered: ["refund_requested"],
  packing: ["shipped", "refund_requested"],
  paid: ["packing", "refund_requested"],
  payment_failed: [],
  pending_payment: ["cancelled"],
  refund_requested: ["refunded"],
  refunded: [],
  shipped: ["delivered", "refund_requested"],
};

function availableOrderTransitions(order: AdminOrder): AdminOrderStatus[] {
  if (
    order.paymentMethod === "payos" &&
    order.status === "pending_payment"
  ) {
    return [];
  }

  return orderTransitions[order.status];
}

function formatVnd(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

interface AdminWorkbenchProps {
  accessToken?: string;
}

export function AdminWorkbench({ accessToken }: AdminWorkbenchProps) {
  const { t } = useI18n();
  const orderStatusLabels = getOrderStatusLabels(t);
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [lastAction, setLastAction] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedTransitions, setSelectedTransitions] = useState<
    Record<string, AdminOrderStatus>
  >({});
  const [refundReferences, setRefundReferences] = useState<Record<string, string>>(
    {},
  );
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== "orders" || !accessToken) {
      return;
    }

    let active = true;

    void listAdminOrders(accessToken)
      .then((result) => {
        if (active) {
          setOrders(result);
        }
      })
      .catch(() => {
        if (active) {
          setOrdersError(t("admin.ordersLoadError"));
        }
      })
      .finally(() => {
        if (active) {
          setOrdersLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [accessToken, activeTab, t]);

  return (
    <main className="min-h-screen bg-[#F2F4F4] px-4 py-6 text-[#10232A] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/15 pb-5">
          <div>
            <p className="text-xs font-medium text-[#006D66]">
              {t("admin.commerce")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              {t("admin.workspaceTitle")}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`inline-flex min-h-10 items-center gap-2 px-3 text-sm font-semibold ${
                activeTab === "products"
                  ? "bg-[#10232A] text-white"
                  : "border border-black/15 bg-white text-[#10232A]"
              }`}
            >
              <Package aria-hidden="true" size={16} />
              {t("admin.products")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("articles")}
              className={`inline-flex min-h-10 items-center gap-2 px-3 text-sm font-semibold ${
                activeTab === "articles"
                  ? "bg-[#10232A] text-white"
                  : "border border-black/15 bg-white text-[#10232A]"
              }`}
            >
              <FileText aria-hidden="true" size={16} />
              {t("admin.articles")}
            </button>
            <button
              type="button"
              onClick={() => {
                setOrdersLoading(true);
                setOrdersError("");
                setActiveTab("orders");
              }}
              className={`inline-flex min-h-10 items-center gap-2 px-3 text-sm font-semibold ${
                activeTab === "orders"
                  ? "bg-[#10232A] text-white"
                  : "border border-black/15 bg-white text-[#10232A]"
              }`}
            >
              <ListOrdered aria-hidden="true" size={16} />
              {t("admin.orders")}
            </button>
          </div>
        </div>

        {lastAction ? (
          <p className="mt-4 border-l-2 border-[#00A99B] bg-white px-3 py-2 text-sm text-slate-700">
            {lastAction}
          </p>
        ) : null}

        {activeTab === "products" ? (
          <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <form
              className="border border-black/10 bg-white p-5 sm:p-7"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);

                try {
                  if (!accessToken) {
                    throw new Error("MISSING_ADMIN_SESSION");
                  }

                  const product = await createAdminProduct(accessToken, {
                    name: String(formData.get("productName") ?? ""),
                    priceVnd: Number(formData.get("priceVnd") ?? 0),
                    purchaseMode: String(
                      formData.get("purchaseMode") ?? "checkout",
                    ) as "checkout" | "preorder" | "quote_only",
                    slug: String(formData.get("slug") ?? ""),
                    stockOnHand: Number(formData.get("stockOnHand") ?? 0),
                    title: String(formData.get("variantTitle") ?? ""),
                  });
                  const description = String(
                    formData.get("productDescription") ?? "",
                  ).trim();
                  if (description) {
                    await publishAdminProductContent(
                      accessToken,
                      product.id,
                      description,
                    );
                  }
                  await publishAdminProduct(accessToken, product.id);
                  setLastAction(t("admin.productPublished"));
                } catch {
                  setLastAction(t("admin.productPublishError"));
                }
              }}
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {t("admin.defaultProductName")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("admin.productSubtitle")}
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center gap-2 bg-[#10232A] px-3 text-sm font-semibold text-white hover:bg-[#006D66]"
                >
                  <Save aria-hidden="true" size={16} />
                  {t("common.publish")}
                </button>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  {t("admin.productName")}
                  <input
                    defaultValue={t("admin.defaultProductName")}
                    name="productName"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  {t("admin.slug")}
                  <input
                    defaultValue={t("admin.defaultProductSlug")}
                    name="slug"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
              </div>

              <div className="mt-8 flex items-center justify-between border-b border-black/10 pb-3">
                <div>
                  <h3 className="font-semibold">
                    {t("admin.variantsAndPricing")}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("admin.productValidation")}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-9 items-center gap-2 border border-black/15 px-3 text-sm font-semibold hover:border-[#006D66]"
                >
                  <Plus aria-hidden="true" size={15} />
                  {t("admin.addVariant")}
                </button>
              </div>

              <label className="mt-6 grid gap-2 text-sm font-medium">
                {t("admin.productMarkdown")}
                <textarea
                  name="productDescription"
                  defaultValue={t("admin.defaultProductDescription")}
                  className="min-h-40 resize-y border border-black/15 p-3 font-mono text-sm font-normal leading-6 outline-none focus:border-[#006D66]"
                />
              </label>

              <div className="mt-4 grid gap-4 border border-black/10 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_12rem]">
                <label className="grid gap-2 text-sm font-medium">
                  {t("admin.variant")}
                  <input
                    defaultValue={t("admin.defaultVariantTitle")}
                    name="variantTitle"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  {t("admin.priceVnd")}
                  <input
                    aria-label={t("admin.priceVnd")}
                    defaultValue={9_500_000}
                    name="priceVnd"
                    inputMode="numeric"
                    type="number"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  {t("admin.stockOnHand")}
                  <input
                    aria-label={t("admin.stockOnHand")}
                    defaultValue={0}
                    min={0}
                    name="stockOnHand"
                    inputMode="numeric"
                    type="number"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  {t("admin.purchaseMode")}
                  <select
                    defaultValue="checkout"
                    name="purchaseMode"
                    className="min-h-11 border border-black/15 bg-white px-3 font-normal outline-none focus:border-[#006D66]"
                  >
                    <option value="checkout">{t("admin.purchaseCheckout")}</option>
                    <option value="preorder">{t("admin.purchasePreorder")}</option>
                    <option value="quote_only">{t("admin.purchaseQuote")}</option>
                  </select>
                </label>
              </div>
            </form>

            <aside className="border border-black/10 bg-white p-5">
              <div className="flex items-center gap-2">
                <Settings2 aria-hidden="true" size={17} />
                <h2 className="font-semibold">{t("admin.configuration")}</h2>
              </div>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="border-b border-black/10 pb-4">
                  <dt className="text-slate-500">{t("admin.stockOnHand")}</dt>
                  <dd className="mt-1 font-semibold">{t("admin.stockAvailable")}</dd>
                </div>
                <div className="border-b border-black/10 pb-4">
                  <dt className="text-slate-500">{t("admin.compatibility")}</dt>
                  <dd className="mt-1 font-semibold">{t("admin.compatibilityValue")}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("admin.productDescription")}</dt>
                  <dd className="mt-1 font-semibold">{t("admin.markdownRevision")}</dd>
                </div>
              </dl>
            </aside>
          </section>
        ) : activeTab === "articles" ? (
          <ArticleStudio accessToken={accessToken} />
        ) : (
          <section className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <h2 className="text-lg font-semibold">{t("admin.orders")}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("admin.ordersDescription")}
                </p>
              </div>
              <p className="text-sm font-medium text-[#006D66]">
                {t("admin.orderCount", { count: orders.length })}
              </p>
            </div>

            {!accessToken ? (
              <p className="mt-5 border-l-2 border-amber-500 bg-white px-3 py-2 text-sm text-slate-700">
                {t("admin.signInToLoadOrders")}
              </p>
            ) : null}

            {ordersError ? (
              <p className="mt-5 border-l-2 border-red-600 bg-white px-3 py-2 text-sm text-slate-700">
                {ordersError}
              </p>
            ) : null}

            {ordersLoading ? (
              <p className="mt-5 border border-black/10 bg-white px-5 py-8 text-sm text-slate-500">
                {t("admin.loadingOrders")}
              </p>
            ) : null}

            {!ordersLoading && accessToken && orders.length === 0 && !ordersError ? (
              <p className="mt-5 border border-black/10 bg-white px-5 py-8 text-sm text-slate-500">
                {t("admin.noOrders")}
              </p>
            ) : null}

            {!ordersLoading && orders.length > 0 ? (
              <div className="mt-5 overflow-x-auto border border-black/10 bg-white">
                <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                  <thead className="border-b border-black/10 bg-[#E4EBEA] text-xs font-semibold uppercase text-[#315057]">
                    <tr>
                      <th className="px-4 py-3">{t("admin.order")}</th>
                      <th className="px-4 py-3">{t("admin.customer")}</th>
                      <th className="px-4 py-3">{t("admin.ordersColumnsProducts")}</th>
                      <th className="px-4 py-3">{t("admin.total")}</th>
                      <th className="px-4 py-3">{t("admin.status")}</th>
                      <th className="px-4 py-3">{t("admin.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const transitions = availableOrderTransitions(order);
                      const nextStatus =
                        selectedTransitions[order.id] ?? transitions[0];
                      const statusClassName =
                        order.status === "cancelled" ||
                        order.status === "payment_failed"
                          ? "bg-red-50 text-red-700"
                          : order.status === "refunded"
                            ? "bg-violet-50 text-violet-700"
                            : order.status === "shipped" ||
                                order.status === "delivered"
                              ? "bg-sky-50 text-sky-700"
                              : "bg-[#E5F4F1] text-[#006D66]";

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-black/10 align-top last:border-b-0"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold">{order.orderNumber}</p>
                            <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                              {new Intl.DateTimeFormat(
                                t("admin.orderDateLocale"),
                                {
                                dateStyle: "short",
                                timeStyle: "short",
                                },
                              ).format(new Date(order.createdAt))}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium">{order.contactName}</p>
                            <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                              {order.contactPhone}
                            </p>
                          </td>
                          <td className="max-w-60 px-4 py-4 text-slate-600">
                            <ul className="space-y-1">
                              {order.lines.map((line) => (
                                <li key={line.id} className="truncate">
                                  {line.title} x{line.quantity}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 font-semibold">
                            {formatVnd(order.totalVnd, t("admin.orderDateLocale"))}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex whitespace-nowrap px-2 py-1 text-xs font-semibold ${statusClassName}`}
                            >
                              {orderStatusLabels[order.status]}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {transitions.length > 0 ? (
                              <div className="grid min-w-52 gap-2">
                                <label className="sr-only" htmlFor={`transition-${order.id}`}>
                                  {t("admin.nextStatus", {
                                    number: order.orderNumber,
                                  })}
                                </label>
                                <select
                                  id={`transition-${order.id}`}
                                  aria-label={t("admin.nextStatus", {
                                    number: order.orderNumber,
                                  })}
                                  value={nextStatus}
                                  onChange={(event) =>
                                    setSelectedTransitions((current) => ({
                                      ...current,
                                      [order.id]: event.target
                                        .value as AdminOrderStatus,
                                    }))
                                  }
                                  className="min-h-10 border border-black/15 bg-white px-2 text-sm outline-none focus:border-[#006D66]"
                                >
                                  {transitions.map((status) => (
                                    <option key={status} value={status}>
                                      {orderStatusLabels[status]}
                                    </option>
                                  ))}
                                </select>
                                {nextStatus === "refunded" &&
                                order.paymentMethod === "payos" ? (
                                  <label className="grid gap-1 text-xs font-medium text-slate-600">
                                    {t("admin.refundReference")}
                                    <input
                                      required
                                      aria-label={t("admin.refundReference")}
                                      value={refundReferences[order.id] ?? ""}
                                      onChange={(event) =>
                                        setRefundReferences((current) => ({
                                          ...current,
                                          [order.id]: event.target.value,
                                        }))
                                      }
                                      className="min-h-10 border border-black/15 px-2 text-sm outline-none focus:border-[#006D66]"
                                    />
                                  </label>
                                ) : null}
                                <button
                                  type="button"
                                  disabled={
                                    !nextStatus || updatingOrderId === order.id
                                  }
                                  onClick={async () => {
                                    if (!accessToken || !nextStatus) {
                                      return;
                                    }
                                    const refundReference =
                                      refundReferences[order.id]?.trim();
                                    if (
                                      nextStatus === "refunded" &&
                                      order.paymentMethod === "payos" &&
                                      !refundReference
                                    ) {
                                      setOrdersError(
                                        t("admin.enterRefundReference", {
                                          number: order.orderNumber,
                                        }),
                                      );
                                      return;
                                    }

                                    setUpdatingOrderId(order.id);
                                    setOrdersError("");
                                    try {
                                      const updated = await transitionAdminOrder(
                                        accessToken,
                                        order.id,
                                        nextStatus,
                                        refundReference,
                                      );
                                      setOrders((current) =>
                                        current.map((currentOrder) =>
                                          currentOrder.id === order.id
                                            ? { ...currentOrder, ...updated }
                                            : currentOrder,
                                        ),
                                      );
                                      setLastAction(
                                        t("admin.updatedOrder", {
                                          number: order.orderNumber,
                                          status: orderStatusLabels[nextStatus],
                                        }),
                                      );
                                    } catch {
                                      setOrdersError(
                                        t("admin.updateOrderError", {
                                          number: order.orderNumber,
                                        }),
                                      );
                                    } finally {
                                      setUpdatingOrderId(null);
                                    }
                                  }}
                                  className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#10232A] px-3 text-sm font-semibold text-white hover:bg-[#006D66] disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                  <Save aria-hidden="true" size={15} />
                                  {updatingOrderId === order.id
                                    ? t("admin.updating")
                                    : t("admin.updateOrder")}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">
                                {t("admin.noActions")}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
