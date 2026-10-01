import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import { CartProvider } from "@/components/store/cart-provider";
import EnglishStorePage from "./page";

describe("EnglishStorePage", () => {
  it("renders storefront copy and product data from the English dictionary", async () => {
    render(
      <I18nProvider locale="en">
        <CartProvider>{await EnglishStorePage({})}</CartProvider>
      </I18nProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Drone Viet Store" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Product categories" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Camera, telemetry, and a dataset workflow for AI and IoT projects.",
      ),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "University & R&D" })
        .some(
          (link) =>
            link.getAttribute("href") ===
            "/en/store?learningStage=university",
        ),
    ).toBe(true);
  });
});
