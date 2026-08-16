"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  loginCustomer,
  registerCustomer,
  type CustomerSession,
} from "@/lib/commerce/customer-auth";

export function CustomerGate({ mode }: { mode: "login" | "register" }) {
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  if (session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F6F7F7] px-5 text-[#10232A]">
        <section className="w-full max-w-sm border border-black/10 bg-white p-6">
          <h1 className="text-2xl font-semibold">Đăng nhập thành công</h1>
          <p className="mt-4 text-sm text-slate-600">{session.user.email}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen bg-[#F6F7F7] lg:grid-cols-[0.88fr_1.12fr]">
      <aside className="hidden bg-[#10232A] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-sm font-bold">
          DRONE VIET
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7DE0D7]">
            Drone education & flight
          </p>
          <h1 className="mt-5 max-w-md text-5xl font-semibold leading-tight">
            Học, mua và vận hành drone có định hướng.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
            Quản lý hành trình khóa học, thiết bị và tư vấn triển khai tại một
            nơi.
          </p>
        </div>
        <p className="text-xs text-slate-500">Drone Việt</p>
      </aside>

      <section className="grid place-items-center px-5 py-12 text-[#10232A] sm:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="text-sm font-bold lg:hidden">
            DRONE VIET
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 lg:mt-0">
            Tài khoản khách hàng
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {isRegister
              ? "Tạo tài khoản để lưu thông tin khóa học và thiết bị."
              : "Đăng nhập để tiếp tục với Drone Việt."}
          </p>

          <form
            className="mt-8"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitting(true);
              setMessage("");
              const data = new FormData(event.currentTarget);

              try {
                const email = String(data.get("email") ?? "");
                const password = String(data.get("password") ?? "");
                const nextSession = isRegister
                  ? await registerCustomer(
                      String(data.get("displayName") ?? ""),
                      email,
                      password,
                    )
                  : await loginCustomer(email, password);
                setSession(nextSession);
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Không thể xác thực tài khoản.",
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {isRegister ? (
              <label className="grid gap-2 text-sm font-medium">
                Họ và tên
                <input
                  required
                  minLength={2}
                  name="displayName"
                  className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                />
              </label>
            ) : null}
            <label className={`grid gap-2 text-sm font-medium ${isRegister ? "mt-4" : ""}`}>
              Email
              <input
                required
                name="email"
                type="email"
                className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-medium">
              Mật khẩu
              <input
                required
                minLength={12}
                name="password"
                type="password"
                className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[#10232A] text-sm font-semibold text-white hover:bg-[#006D66] disabled:bg-slate-400"
            >
              {isRegister ? <UserPlus aria-hidden="true" size={16} /> : <LogIn aria-hidden="true" size={16} />}
              {submitting
                ? "Đang xử lý..."
                : isRegister
                  ? "Tạo tài khoản"
                  : "Đăng nhập"}
            </button>
            {message ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}
          </form>

          <p className="mt-6 text-sm text-slate-600">
            {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
            <Link
              href={isRegister ? "/dang-nhap" : "/dang-ky"}
              className="font-semibold text-[#006D66] hover:text-[#10232A]"
            >
              {isRegister ? "Đăng nhập" : "Tạo tài khoản"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
