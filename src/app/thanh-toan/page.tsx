"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/store/cart-provider";
import { formatVnd } from "@/lib/commerce/storefront-catalog";

type PaymentMethod = "bank_transfer" | "cod" | "payos";

export default function CheckoutPage() {
  const { lines, totalVnd } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("payos");
  const [statusMessage, setStatusMessage] = useState("");

  if (lines.length === 0) {
    return (
      <main className="min-h-screen bg-[#F6F7F7] px-5 py-20 text-[#10232A] sm:px-8">
        <div className="mx-auto max-w-3xl border-t border-black/15 pt-6">
          <h1 className="text-3xl font-semibold">Thanh toán</h1>
          <p className="mt-5 text-slate-600">
            Thêm thiết bị vào giỏ hàng trước khi checkout.
          </p>
          <Link
            href="/cua-hang"
            className="mt-7 inline-flex min-h-11 items-center bg-[#10232A] px-4 text-sm font-semibold text-white hover:bg-[#006D66]"
          >
            Khám phá thiết bị
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F7] px-5 py-10 text-[#10232A] sm:px-8 sm:py-16">
      <form
        className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
        onSubmit={(event) => {
          event.preventDefault();
          setStatusMessage(
            "Yêu cầu checkout đã sẵn sàng. PayOS redirect sẽ được tạo bởi Commerce API.",
          );
        }}
      >
        <section className="space-y-8">
          <div className="border-b border-black/15 pb-5">
            <p className="text-xs font-medium text-[#006D66]">
              Drone Viet Store
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Thanh toán</h1>
          </div>

          <section className="border border-black/10 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-semibold">Thông tin liên hệ</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Họ và tên
                <input
                  required
                  className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Số điện thoại
                <input
                  required
                  inputMode="tel"
                  className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                Email
                <input
                  type="email"
                  className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                />
              </label>
            </div>
          </section>

          <section className="border border-black/10 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-semibold">Giao hàng</h2>
            <label className="mt-5 grid gap-2 text-sm font-medium">
              Địa chỉ nhận hàng
              <input
                required
                className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
              />
            </label>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Phí giao hàng được Commerce API tính lại theo tỉnh/thành, quận/huyện
              và trọng lượng thiết bị.
            </p>
          </section>

          <section className="border border-black/10 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
            <div className="mt-5 space-y-3">
              {[
                {
                  label: "PayOS",
                  value: "payos" as const,
                  description: "Chuyển khoản/QR qua cổng thanh toán PayOS.",
                },
                {
                  label: "Thanh toán khi nhận hàng",
                  value: "cod" as const,
                  description: "Xác nhận đơn trước khi giao thiết bị.",
                },
                {
                  label: "Chuyển khoản ngân hàng",
                  value: "bank_transfer" as const,
                  description: "Nhận thông tin chuyển khoản sau khi tạo đơn.",
                },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex cursor-pointer gap-3 border border-black/10 p-4 has-[:checked]:border-[#006D66]"
                >
                  <input
                    aria-label={method.label}
                    checked={paymentMethod === method.value}
                    name="payment-method"
                    onChange={() => setPaymentMethod(method.value)}
                    type="radio"
                    value={method.value}
                  />
                  <span>
                    <span className="block text-sm font-semibold">
                      {method.label}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-slate-500">
                      {method.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </section>

        <aside className="h-fit border border-black/10 bg-white p-5">
          <h2 className="text-sm font-semibold">Tóm tắt đơn hàng</h2>
          <ul className="mt-5 space-y-4 border-t border-black/10 pt-4">
            {lines.map((line) => (
              <li key={line.slug} className="flex justify-between gap-4 text-sm">
                <span className="text-slate-600">
                  {line.title} × {line.quantity}
                </span>
                <span className="font-semibold">
                  {formatVnd(line.priceVnd * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between border-t border-black/10 pt-4">
            <span className="font-semibold">Tạm tính</span>
            <span className="font-semibold">{formatVnd(totalVnd)}</span>
          </div>
          <button
            type="submit"
            className="mt-6 flex min-h-11 w-full items-center justify-center bg-[#10232A] px-4 text-sm font-semibold text-white hover:bg-[#006D66]"
          >
            Đặt đơn hàng
          </button>
          {statusMessage ? (
            <p className="mt-4 border-l-2 border-[#00A99B] pl-3 text-xs leading-5 text-slate-600">
              {statusMessage}
            </p>
          ) : null}
        </aside>
      </form>
    </main>
  );
}
