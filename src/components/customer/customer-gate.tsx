"use client";

import { LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  loginCustomer,
  registerCustomer,
  type CustomerSession,
} from "@/lib/commerce/customer-auth";

export function CustomerGate() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F6F7F7] px-5 text-[#10232A]">
        <section className="w-full max-w-sm border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Drone Việt
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Đăng nhập thành công</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {session.user.email}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F6F7F7] px-5 text-[#10232A]">
      <section className="w-full max-w-sm border border-black/10 bg-white p-6">
        <div className="flex border-b border-black/10">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`min-h-10 flex-1 text-sm font-semibold ${
              mode === "login" ? "border-b-2 border-[#006D66] text-[#10232A]" : "text-slate-500"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`min-h-10 flex-1 text-sm font-semibold ${
              mode === "register" ? "border-b-2 border-[#006D66] text-[#10232A]" : "text-slate-500"
            }`}
          >
            Tạo tài khoản
          </button>
        </div>
        <h1 className="mt-6 text-2xl font-semibold">
          {mode === "login" ? "Đăng nhập khách hàng" : "Tạo tài khoản khách hàng"}
        </h1>
        <form
          className="mt-6"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setMessage("");
            const data = new FormData(event.currentTarget);

            try {
              const email = String(data.get("email") ?? "");
              const password = String(data.get("password") ?? "");
              const nextSession =
                mode === "login"
                  ? await loginCustomer(email, password)
                  : await registerCustomer(
                      String(data.get("displayName") ?? ""),
                      email,
                      password,
                    );
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
          {mode === "register" ? (
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
          <label className={`grid gap-2 text-sm font-medium ${mode === "register" ? "mt-4" : ""}`}>
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
            {mode === "login" ? (
              <LogIn aria-hidden="true" size={16} />
            ) : (
              <UserPlus aria-hidden="true" size={16} />
            )}
            {submitting
              ? "Đang xử lý..."
              : mode === "login"
                ? "Đăng nhập"
                : "Tạo tài khoản"}
          </button>
          {message ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}
        </form>
      </section>
    </main>
  );
}
