"use client";

import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { useOptionalCustomerSession } from "./customer-session-provider";
import type { CustomerProfile } from "@/lib/commerce/customer-api";

type CustomerAccountMenuProps = {
  accountHref: string;
  className?: string;
  loginHref: string;
  visitorClassName?: string;
};

export function CustomerAccountMenu({
  accountHref,
  className,
  loginHref,
  visitorClassName,
}: CustomerAccountMenuProps) {
  const { t } = useI18n();
  const session = useOptionalCustomerSession();
  const buttonClassName =
    className ??
    "grid size-10 place-items-center rounded-full border border-white/12 text-slate-200 transition hover:border-[#00D1C1] hover:text-[#00D1C1]";

  if (!session?.user) {
    return (
      <Link
        href={loginHref}
        aria-label={t("header.signIn")}
        title={t("header.signIn")}
        className={visitorClassName ?? buttonClassName}
      >
        {visitorClassName ? t("header.signIn") : <UserRound aria-hidden="true" size={17} />}
      </Link>
    );
  }

  return (
    <SignedInCustomerMenu
      accountHref={accountHref}
      buttonClassName={buttonClassName}
      loginHref={loginHref}
      logout={session.logout}
      user={session.user}
    />
  );
}

function SignedInCustomerMenu({
  accountHref,
  buttonClassName,
  loginHref,
  logout,
}: {
  accountHref: string;
  buttonClassName: string;
  loginHref: string;
  logout: () => Promise<void>;
  user: CustomerProfile;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.replace(loginHref);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("auth.account")}
        title={t("auth.account")}
        onClick={() => setOpen((current) => !current)}
        className={buttonClassName}
      >
        <UserRound aria-hidden="true" size={17} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-44 border border-white/15 bg-[#10232A] p-1 shadow-2xl"
        >
          <Link
            role="menuitem"
            href={accountHref}
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-slate-100 hover:bg-white/10"
          >
            {t("account.title")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-100 hover:bg-white/10"
          >
            <LogOut aria-hidden="true" size={15} />
            {t("account.signOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
