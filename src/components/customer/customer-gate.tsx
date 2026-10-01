"use client";

import Link from "next/link";
import { Globe2, LogIn, MessageCircle, UserPlus } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useCustomerSession } from "@/components/customer/customer-session-provider";
import { useI18n } from "@/components/i18n-provider";
import {
  loginCustomer,
  registerCustomer,
} from "@/lib/commerce/customer-auth";

function nextPathFromSearch(search: string, defaultPath: string): string {
  const requestedNext = new URLSearchParams(search).get("next");

  return requestedNext?.startsWith("/") && isSafeLocalPath(requestedNext)
    ? requestedNext
    : defaultPath;
}

function isSafeLocalPath(path: string): boolean {
  return new URL(path, "https://droneviet.local").origin ===
    "https://droneviet.local";
}

function nextPathFromLocation(defaultPath: string): string {
  return nextPathFromSearch(window.location.search, defaultPath);
}

function subscribeToLocationChange(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);

  return () => window.removeEventListener("popstate", onStoreChange);
}

function getBrowserSearch() {
  return window.location.search;
}

function getServerSearch() {
  return "";
}

function useNextPath(defaultPath: string): string {
  const search = useSyncExternalStore(
    subscribeToLocationChange,
    getBrowserSearch,
    getServerSearch,
  );

  return nextPathFromSearch(search, defaultPath);
}

export function CustomerGate({ mode }: { mode: "login" | "register" }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const { setUser } = useCustomerSession();
  const [message, setMessage] = useState("");
  const [oauthPending, setOauthPending] = useState<"google" | "zalo" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";
  const homeHref = locale === "vi" ? "/" : "/en";
  const loginHref = locale === "vi" ? "/dang-nhap" : "/en/login";
  const registerHref = locale === "vi" ? "/dang-ky" : "/en/register";
  const accountHref = locale === "vi" ? "/tai-khoan" : "/en/account";
  const nextPath = useNextPath(accountHref);

  function startOauth(provider: "google" | "zalo") {
    const authUrl =
      provider === "google"
        ? process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL
        : process.env.NEXT_PUBLIC_ZALO_LOGIN_URL;

    if (!authUrl) {
      setMessage(
        t("auth.oauthNotConfigured", {
          provider: provider === "google" ? "Google" : "Zalo",
        }),
      );
      return;
    }

    setOauthPending(provider);
    window.location.assign(authUrl);
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[0.88fr_1.12fr]">
      <aside className="hidden bg-[#10232A] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href={homeHref} className="text-sm font-bold">
          {t("common.brandAscii")}
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7DE0D7]">
            {t("auth.eyebrow")}
          </p>
          <h1 className="mt-5 max-w-md text-5xl font-semibold leading-tight">
            {t("auth.panelTitle")}
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
            {t("auth.panelDescription")}
          </p>
        </div>
        <p className="text-xs text-slate-500">{t("common.brandName")}</p>
      </aside>

      <section className="grid place-items-center px-5 py-12 text-[#10232A] sm:px-8">
        <div className="w-full max-w-sm">
          <Link href={homeHref} className="text-sm font-bold lg:hidden">
            {t("common.brandAscii")}
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 lg:mt-0">
            {t("auth.account")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            {isRegister ? t("auth.createAccount") : t("auth.signIn")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {isRegister
              ? t("auth.registerDescription")
              : t("auth.loginDescription")}
          </p>

          {!isRegister ? (
            <>
              <div className="mt-8 grid gap-3">
                <button
                  type="button"
                  onClick={() => startOauth("google")}
                  disabled={oauthPending !== null}
                  className="inline-flex min-h-11 items-center justify-center gap-3 border border-black/15 bg-white text-sm font-semibold hover:border-[#006D66] disabled:text-slate-400"
                >
                  <Globe2 aria-hidden="true" size={18} />
                  {t("auth.continueGoogle")}
                </button>
                <button
                  type="button"
                  onClick={() => startOauth("zalo")}
                  disabled={oauthPending !== null}
                  className="inline-flex min-h-11 items-center justify-center gap-3 border border-black/15 bg-white text-sm font-semibold hover:border-[#006D66] disabled:text-slate-400"
                >
                  <MessageCircle aria-hidden="true" size={18} />
                  {t("auth.continueZalo")}
                </button>
              </div>
              <div className="my-7 flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-black/10" />
                {t("auth.orEmail")}
                <span className="h-px flex-1 bg-black/10" />
              </div>
            </>
          ) : null}

          <form
            className={isRegister ? "mt-8" : ""}
            method="post"
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
                setUser(nextSession.user);
                router.replace(nextPathFromLocation(accountHref));
              } catch (error) {
                setMessage(
                  error instanceof Error &&
                    error.message !== "AUTHENTICATION_FAILED" &&
                    error.message !== "COMMERCE_API_NOT_CONFIGURED"
                    ? error.message
                    : t("auth.authenticationFailed"),
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {isRegister ? (
              <label className="grid gap-2 text-sm font-medium">
                {t("common.fullName")}
                <input
                  required
                  minLength={2}
                  name="displayName"
                  className="min-h-11 border border-black/15 px-3 font-normal outline-none focus:border-[#006D66]"
                />
              </label>
            ) : null}
            <label className={`grid gap-2 text-sm font-medium ${isRegister ? "mt-4" : ""}`}>
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
                minLength={6}
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
                ? t("auth.processing")
                : isRegister
                  ? t("auth.createAccount")
                  : t("auth.signIn")}
            </button>
            {message ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}
          </form>

          <p className="mt-6 text-sm text-slate-600">
            {isRegister ? t("auth.hasAccount") : t("auth.noAccount")}{" "}
            <Link
              href={
                isRegister
                  ? `${loginHref}?next=${encodeURIComponent(nextPath)}`
                  : `${registerHref}?next=${encodeURIComponent(nextPath)}`
              }
              className="font-semibold text-[#006D66] hover:text-[#10232A]"
            >
              {isRegister ? t("auth.signIn") : t("auth.createAccount")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
