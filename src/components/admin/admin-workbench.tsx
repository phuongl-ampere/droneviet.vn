"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  FileText,
  ListOrdered,
  Package,
  Plus,
  Save,
  Settings2,
} from "lucide-react";
import { MarkdownDocument } from "@/components/content/markdown-document";
import {
  createAdminArticle,
  createAdminProduct,
  listAdminOrders,
  publishAdminArticle,
  publishAdminProduct,
  publishAdminProductContent,
  transitionAdminOrder,
  type AdminOrder,
  type AdminOrderStatus,
} from "@/lib/commerce/admin-api";

type AdminTab = "articles" | "orders" | "products";

const orderStatusLabels: Record<AdminOrderStatus, string> = {
  cancelled: "Đã hủy",
  delivered: "Đã giao",
  packing: "Đang đóng gói",
  paid: "Đã thanh toán",
  payment_failed: "Thanh toán lỗi",
  pending_payment: "Chờ thanh toán",
  refund_requested: "Chờ hoàn tiền",
  refunded: "Đã hoàn tiền",
  shipped: "Đang giao",
};

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

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

interface AdminWorkbenchProps {
  accessToken?: string;
}

export function AdminWorkbench({ accessToken }: AdminWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [articleBody, setArticleBody] = useState(
    "# Drone trong lớp học STEM\n\nNội dung sẽ được render từ Markdown sau khi publish.",
  );
  const [articlePreview, setArticlePreview] = useState(false);
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
          setOrdersError("Không thể tải đơn hàng từ Commerce API.");
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
  }, [accessToken, activeTab]);

  return (
    <main className="min-h-screen bg-[#F2F4F4] px-4 py-6 text-[#10232A] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/15 pb-5">
          <div>
            <p className="text-xs font-medium text-[#006D66]">
              Drone Viet Commerce
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Admin vận hành</h1>
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
              Sản phẩm
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
              Bài viết
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
              Đơn hàng
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
                    throw new Error("Missing admin session");
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
                  setLastAction("Đã xuất bản sản phẩm qua Commerce API.");
                } catch {
                  setLastAction("Không thể lưu sản phẩm qua Commerce API.");
                }
              }}
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <h2 className="text-lg font-semibold">DV Primary Lab</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Drone giáo dục · SKU configuration
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center gap-2 bg-[#10232A] px-3 text-sm font-semibold text-white hover:bg-[#006D66]"
                >
                  <Save aria-hidden="true" size={16} />
                  Xuất bản
                </button>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Tên sản phẩm
                  <input
                  defaultValue="DV Primary Lab"
                  name="productName"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Slug
                  <input
                  defaultValue="dv-primary-lab"
                  name="slug"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
              </div>

              <div className="mt-8 flex items-center justify-between border-b border-black/10 pb-3">
                <div>
                  <h3 className="font-semibold">Variants và giá</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Dữ liệu này sẽ được validate bởi API trước khi publish.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-9 items-center gap-2 border border-black/15 px-3 text-sm font-semibold hover:border-[#006D66]"
                >
                  <Plus aria-hidden="true" size={15} />
                  Thêm variant
                </button>
              </div>

              <label className="mt-6 grid gap-2 text-sm font-medium">
                Mô tả sản phẩm Markdown
                <textarea
                  name="productDescription"
                  defaultValue="# DV Primary Lab\n\nDrone STEM cho lớp học tiểu học."
                  className="min-h-40 resize-y border border-black/15 p-3 font-mono text-sm font-normal leading-6 outline-none focus:border-[#006D66]"
                />
              </label>

              <div className="mt-4 grid gap-4 border border-black/10 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_12rem]">
                <label className="grid gap-2 text-sm font-medium">
                  Variant
                  <input
                    defaultValue="Standard kit"
                    name="variantTitle"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Giá VND
                  <input
                    aria-label="Giá VND"
                    defaultValue={9_500_000}
                    name="priceVnd"
                    inputMode="numeric"
                    type="number"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Tồn kho
                  <input
                    aria-label="Tồn kho"
                    defaultValue={0}
                    min={0}
                    name="stockOnHand"
                    inputMode="numeric"
                    type="number"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Purchase mode
                  <select
                    defaultValue="checkout"
                    name="purchaseMode"
                    className="min-h-11 border border-black/15 bg-white px-3 font-normal outline-none focus:border-[#006D66]"
                  >
                    <option value="checkout">Checkout</option>
                    <option value="preorder">Pre-order</option>
                    <option value="quote_only">Quote only</option>
                  </select>
                </label>
              </div>
            </form>

            <aside className="border border-black/10 bg-white p-5">
              <div className="flex items-center gap-2">
                <Settings2 aria-hidden="true" size={17} />
                <h2 className="font-semibold">Cấu hình</h2>
              </div>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="border-b border-black/10 pb-4">
                  <dt className="text-slate-500">Tồn kho</dt>
                  <dd className="mt-1 font-semibold">24 khả dụng</dd>
                </div>
                <div className="border-b border-black/10 pb-4">
                  <dt className="text-slate-500">Compatibility</dt>
                  <dd className="mt-1 font-semibold">Pin Basic, Shield Kit</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Product description</dt>
                  <dd className="mt-1 font-semibold">
                    Markdown revision 3
                  </dd>
                </div>
              </dl>
            </aside>
          </section>
        ) : activeTab === "articles" ? (
          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            <form
              className="border border-black/10 bg-white p-5 sm:p-7"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);

                try {
                  if (!accessToken) {
                    throw new Error("Missing admin session");
                  }

                  const article = await createAdminArticle(accessToken, {
                    bodyMarkdown: articleBody,
                    slug: String(formData.get("articleSlug") ?? ""),
                    title: String(formData.get("articleTitle") ?? ""),
                  });
                  await publishAdminArticle(accessToken, article.id, {
                    bodyMarkdown: articleBody,
                    title: String(formData.get("articleTitle") ?? ""),
                  });
                  setLastAction("Đã xuất bản bài viết qua Commerce API.");
                } catch {
                  setLastAction("Không thể lưu bài viết qua Commerce API.");
                }
              }}
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <h2 className="text-lg font-semibold">Bài viết mới</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Markdown được sanitize trước khi public.
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center gap-2 bg-[#10232A] px-3 text-sm font-semibold text-white hover:bg-[#006D66]"
                >
                  <Save aria-hidden="true" size={16} />
                  Xuất bản
                </button>
              </div>

              <label className="mt-6 grid gap-2 text-sm font-medium">
                Tiêu đề
                <input
                  defaultValue="Drone trong lớp học STEM"
                  name="articleTitle"
                  className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                />
              </label>
              <input type="hidden" name="articleSlug" value="drone-trong-lop-hoc-stem" />
              <label className="mt-5 grid gap-2 text-sm font-medium">
                Nội dung Markdown
                <textarea
                  aria-label="Nội dung Markdown"
                  name="articleBody"
                  value={articleBody}
                  onChange={(event) => setArticleBody(event.target.value)}
                  className="min-h-72 resize-y border border-black/15 p-3 font-mono text-sm font-normal leading-6 outline-none focus:border-[#006D66]"
                />
              </label>
              <button
                type="button"
                onClick={() => setArticlePreview((current) => !current)}
                className="mt-5 inline-flex min-h-10 items-center gap-2 border border-black/15 px-3 text-sm font-semibold hover:border-[#006D66]"
              >
                <Eye aria-hidden="true" size={16} />
                Xem trước
              </button>
            </form>

            <section className="border border-black/10 bg-white p-5 sm:p-7">
              <p className="text-sm font-semibold">Preview</p>
              <div className="mt-5 border-t border-black/10 pt-5">
                {articlePreview ? (
                  <MarkdownDocument content={articleBody} />
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    Chọn “Xem trước” để render Markdown với cùng pipeline public.
                  </p>
                )}
              </div>
            </section>
          </section>
        ) : (
          <section className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <h2 className="text-lg font-semibold">Đơn hàng</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cập nhật theo luồng đóng gói, giao hàng, hủy và hoàn tiền.
                </p>
              </div>
              <p className="text-sm font-medium text-[#006D66]">
                {orders.length} đơn
              </p>
            </div>

            {!accessToken ? (
              <p className="mt-5 border-l-2 border-amber-500 bg-white px-3 py-2 text-sm text-slate-700">
                Đăng nhập quản trị để tải đơn hàng.
              </p>
            ) : null}

            {ordersError ? (
              <p className="mt-5 border-l-2 border-red-600 bg-white px-3 py-2 text-sm text-slate-700">
                {ordersError}
              </p>
            ) : null}

            {ordersLoading ? (
              <p className="mt-5 border border-black/10 bg-white px-5 py-8 text-sm text-slate-500">
                Đang tải đơn hàng...
              </p>
            ) : null}

            {!ordersLoading && accessToken && orders.length === 0 && !ordersError ? (
              <p className="mt-5 border border-black/10 bg-white px-5 py-8 text-sm text-slate-500">
                Chưa có đơn hàng.
              </p>
            ) : null}

            {!ordersLoading && orders.length > 0 ? (
              <div className="mt-5 overflow-x-auto border border-black/10 bg-white">
                <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                  <thead className="border-b border-black/10 bg-[#E4EBEA] text-xs font-semibold uppercase text-[#315057]">
                    <tr>
                      <th className="px-4 py-3">Đơn hàng</th>
                      <th className="px-4 py-3">Khách hàng</th>
                      <th className="px-4 py-3">Sản phẩm</th>
                      <th className="px-4 py-3">Tổng tiền</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Thao tác</th>
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
                              {new Intl.DateTimeFormat("vi-VN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              }).format(new Date(order.createdAt))}
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
                            {formatVnd(order.totalVnd)}
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
                                  Trạng thái tiếp theo {order.orderNumber}
                                </label>
                                <select
                                  id={`transition-${order.id}`}
                                  aria-label={`Trạng thái tiếp theo ${order.orderNumber}`}
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
                                    Mã hoàn tiền
                                    <input
                                      required
                                      aria-label={`Mã hoàn tiền ${order.orderNumber}`}
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
                                        `Nhập mã hoàn tiền cho ${order.orderNumber}.`,
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
                                        `Đã cập nhật ${order.orderNumber} sang ${orderStatusLabels[nextStatus]}.`,
                                      );
                                    } catch {
                                      setOrdersError(
                                        `Không thể cập nhật ${order.orderNumber}.`,
                                      );
                                    } finally {
                                      setUpdatingOrderId(null);
                                    }
                                  }}
                                  className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#10232A] px-3 text-sm font-semibold text-white hover:bg-[#006D66] disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                  <Save aria-hidden="true" size={15} />
                                  {updatingOrderId === order.id
                                    ? "Đang cập nhật..."
                                    : "Cập nhật đơn"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">
                                Không còn thao tác
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
