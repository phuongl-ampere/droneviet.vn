"use client";

import { useState } from "react";
import { findGuestOrder } from "@/lib/commerce/orders";

export default function TrackOrderPage() {
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState<{
    orderNumber?: string;
    status?: string;
    totalVnd?: number;
  } | null>(null);

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#10232A] sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <section>
          <p className="text-xs font-medium text-[#006D66]">Drone Viet Store</p>
          <h1 className="mt-3 text-4xl font-semibold">Theo dõi đơn hàng</h1>
          <p className="mt-5 leading-7 text-slate-600">
            Nhập mã đơn và số điện thoại dùng khi checkout để xem trạng thái
            đóng gói, giao hàng và thanh toán.
          </p>
        </section>
        <form
          className="border border-black/10 bg-white p-5 sm:p-7"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setMessage("");
            setOrder(null);

            try {
              const result = (await findGuestOrder(
                String(data.get("orderNumber") ?? ""),
                String(data.get("phone") ?? ""),
              )) as {
                orderNumber: string;
                status: string;
                totalVnd: number;
              };
              setOrder(result);
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : "Order was not found",
              );
            }
          }}
        >
          <label className="grid gap-2 text-sm font-medium">
            Mã đơn hàng
            <input
              required
              name="orderNumber"
              placeholder="DV-XXXXXXXX"
              className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
            />
          </label>
          <label className="mt-5 grid gap-2 text-sm font-medium">
            Số điện thoại
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
            Tra cứu đơn
          </button>
          {order ? (
            <dl className="mt-6 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Mã đơn</dt>
                <dd className="font-semibold">{order.orderNumber}</dd>
              </div>
              <div className="mt-3 flex justify-between gap-4">
                <dt className="text-slate-500">Trạng thái</dt>
                <dd className="font-semibold">{order.status}</dd>
              </div>
            </dl>
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
