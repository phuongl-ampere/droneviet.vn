"use client";

import { useState } from "react";
import { submitQuoteRequest } from "@/lib/commerce/quotes";

interface QuoteFormProps {
  productName?: string;
}

export function QuoteForm({ productName = "" }: QuoteFormProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="border border-black/10 bg-white p-5 sm:p-7"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage("");
        const data = new FormData(event.currentTarget);

        try {
          await submitQuoteRequest({
            budgetVnd: Number(data.get("budgetVnd") ?? 0) || undefined,
            contactName: String(data.get("contactName") ?? ""),
            email: String(data.get("email") ?? "") || undefined,
            organization: String(data.get("organization") ?? ""),
            phone: String(data.get("phone") ?? ""),
            quantity: Number(data.get("quantity") ?? 1),
            requirements: String(data.get("requirements") ?? ""),
          });
          setMessage("Yêu cầu đã được gửi. Drone Việt sẽ liên hệ để xác nhận cấu hình.");
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Không thể gửi yêu cầu báo giá.",
          );
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Đơn vị
          <input
            required
            name="organization"
            className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Người liên hệ
          <input
            required
            name="contactName"
            className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Số điện thoại
          <input
            required
            name="phone"
            inputMode="tel"
            className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Số lượng dự kiến
          <input
            required
            min={1}
            name="quantity"
            type="number"
            defaultValue={1}
            className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Ngân sách dự kiến
          <input
            name="budgetVnd"
            inputMode="numeric"
            type="number"
            className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
          />
        </label>
      </div>
      <label className="mt-5 grid gap-2 text-sm font-medium">
        Thiết bị và yêu cầu triển khai
        <textarea
          name="requirements"
          defaultValue={productName}
          className="min-h-36 resize-y border border-black/15 p-3 font-normal leading-6 outline-none focus:border-[#006D66]"
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 min-h-11 bg-[#10232A] px-4 text-sm font-semibold text-white hover:bg-[#006D66]"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
      </button>
      {message ? (
        <p className="mt-4 border-l-2 border-[#00A99B] pl-3 text-sm leading-6 text-slate-600">
          {message}
        </p>
      ) : null}
    </form>
  );
}
