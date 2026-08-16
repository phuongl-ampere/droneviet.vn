"use client";

import { useState } from "react";
import {
  Eye,
  FileText,
  Package,
  Plus,
  Save,
  Settings2,
} from "lucide-react";
import { MarkdownDocument } from "@/components/content/markdown-document";

type AdminTab = "articles" | "products";

export function AdminWorkbench() {
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [articleBody, setArticleBody] = useState(
    "# Drone trong lớp học STEM\n\nNội dung sẽ được render từ Markdown sau khi publish.",
  );
  const [articlePreview, setArticlePreview] = useState(false);
  const [lastAction, setLastAction] = useState("");

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
              onSubmit={(event) => {
                event.preventDefault();
                setLastAction("Đã lưu bản nháp sản phẩm.");
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
                  Lưu bản nháp
                </button>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Tên sản phẩm
                  <input
                    defaultValue="DV Primary Lab"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Slug
                  <input
                    defaultValue="dv-primary-lab"
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

              <div className="mt-4 grid gap-4 border border-black/10 p-4 sm:grid-cols-[minmax(0,1fr)_10rem_12rem]">
                <label className="grid gap-2 text-sm font-medium">
                  Variant
                  <input
                    defaultValue="Standard kit"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Giá VND
                  <input
                    aria-label="Giá VND"
                    defaultValue={9_500_000}
                    inputMode="numeric"
                    type="number"
                    className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Purchase mode
                  <select
                    defaultValue="checkout"
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
        ) : (
          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            <form
              className="border border-black/10 bg-white p-5 sm:p-7"
              onSubmit={(event) => {
                event.preventDefault();
                setLastAction("Đã lưu bản nháp bài viết.");
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
                  Lưu bản nháp
                </button>
              </div>

              <label className="mt-6 grid gap-2 text-sm font-medium">
                Tiêu đề
                <input
                  defaultValue="Drone trong lớp học STEM"
                  className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                />
              </label>
              <label className="mt-5 grid gap-2 text-sm font-medium">
                Nội dung Markdown
                <textarea
                  aria-label="Nội dung Markdown"
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
        )}
      </div>
    </main>
  );
}
