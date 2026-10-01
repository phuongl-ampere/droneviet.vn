"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/content";
import { translate, type TranslationKey } from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  t: (
    key: TranslationKey,
    variables?: Record<string, string | number>,
  ) => string;
};

const defaultI18nContext: I18nContextValue = {
  locale: "vi",
  t: (key, variables) => translate("vi", key, variables),
};

const I18nContext = createContext<I18nContextValue>(defaultI18nContext);

export function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key, variables) => translate(locale, key, variables),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
