"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { loginAdmin, type AdminSession } from "@/lib/commerce/admin-api";
import { AdminWorkbench } from "./admin-workbench";

export function AdminGate() {
  const { t } = useI18n();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session) {
    return <AdminWorkbench accessToken={session.accessToken} />;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F2F4F4] px-5 text-[#10232A]">
      <form
        className="w-full max-w-sm border border-black/10 bg-white p-6"
        method="post"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setMessage("");
          const formData = new FormData(event.currentTarget);

          try {
            const nextSession = await loginAdmin(
              String(formData.get("email") ?? ""),
              String(formData.get("password") ?? ""),
            );
            setSession(nextSession);
          } catch {
            setMessage(t("admin.loginError"));
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <p className="text-xs font-medium text-[#006D66]">
          {t("admin.commerce")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{t("admin.loginTitle")}</h1>
        <label className="mt-6 grid gap-2 text-sm font-medium">
          {t("common.email")}
          <input
            required
            name="email"
            type="email"
            className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
          />
        </label>
        <label className="mt-4 grid gap-2 text-sm font-medium">
          {t("common.password")}
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
          disabled={isSubmitting}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[#10232A] text-sm font-semibold text-white hover:bg-[#006D66]"
        >
          <LogIn aria-hidden="true" size={16} />
          {isSubmitting ? t("admin.authenticating") : t("auth.signIn")}
        </button>
        {message ? (
          <p className="mt-4 border-l-2 border-red-600 pl-3 text-sm text-slate-600">
            {message}
          </p>
        ) : null}
      </form>
    </main>
  );
}
