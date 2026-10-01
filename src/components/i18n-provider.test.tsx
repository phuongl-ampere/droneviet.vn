import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider, useI18n } from "./i18n-provider";

function TranslationProbe() {
  const { locale, t } = useI18n();

  return <p>{`${locale}: ${t("store.search")}`}</p>;
}

describe("I18nProvider", () => {
  it("provides the selected locale and translation function to client components", () => {
    render(
      <I18nProvider locale="en">
        <TranslationProbe />
      </I18nProvider>,
    );

    expect(screen.getByText("en: Search")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });

  it("uses Vietnamese as the default locale outside the page chrome", () => {
    render(<TranslationProbe />);

    expect(screen.getByText("vi: Tìm kiếm")).toBeInTheDocument();
  });
});
