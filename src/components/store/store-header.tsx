"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart-provider";

const navigation = [
  { href: "/cua-hang", label: "Cửa hàng" },
  { href: "/cua-hang?collection=stem", label: "Drone giáo dục" },
  { href: "/cua-hang?collection=research", label: "Nghiên cứu" },
  { href: "/giao-trinh", label: "Khóa học" },
  { href: "/giai-phap", label: "Giải pháp lab" },
];

export function StoreHeader() {
  const { lineCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white text-[#10232A]">
      <div className="mx-auto flex min-h-16 max-w-[90rem] items-center gap-5 px-5 sm:px-8">
        <Link href="/cua-hang" className="shrink-0 text-sm font-bold">
          DRONE VIET
        </Link>
        <nav
          aria-label="Điều hướng cửa hàng"
          className="hidden flex-1 items-center gap-6 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 hover:text-[#10232A]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Tìm kiếm"
            title="Tìm kiếm"
            onClick={() => setSearchOpen((current) => !current)}
            className="grid size-10 place-items-center hover:bg-black/5"
          >
            <Search aria-hidden="true" size={18} />
          </button>
          <Link
            href="/gio-hang"
            aria-label={`Giỏ hàng (${lineCount})`}
            title="Giỏ hàng"
            className="grid size-10 place-items-center hover:bg-black/5"
          >
            <ShoppingBag aria-hidden="true" size={18} />
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            title={menuOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setMenuOpen((current) => !current)}
            className="grid size-10 place-items-center lg:hidden hover:bg-black/5"
          >
            {menuOpen ? (
              <X aria-hidden="true" size={18} />
            ) : (
              <Menu aria-hidden="true" size={18} />
            )}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <form
          action="/cua-hang"
          className="border-t border-black/10 bg-white px-5 py-3 sm:px-8"
        >
          <label className="mx-auto flex max-w-[90rem] items-center gap-3">
            <Search aria-hidden="true" size={17} />
            <span className="sr-only">Tìm thiết bị</span>
            <input
              name="q"
              autoFocus
              placeholder="Tìm drone, phụ kiện hoặc khóa học"
              className="min-h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        </form>
      ) : null}

      {menuOpen ? (
        <nav
          aria-label="Điều hướng cửa hàng trên điện thoại"
          className="border-t border-black/10 bg-white px-5 py-4 lg:hidden"
        >
          <div className="grid gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-black/10 py-3 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
