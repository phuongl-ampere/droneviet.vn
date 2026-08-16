import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider } from "./cart-provider";
import { StoreHeader } from "./store-header";

describe("StoreHeader", () => {
  it("shows commerce navigation, search, and current cart count", () => {
    render(
      <CartProvider
        initialLines={[
          {
            priceVnd: 9_500_000,
            quantity: 1,
            slug: "dv-primary-lab",
            title: "DV Primary Lab",
          },
        ]}
      >
        <StoreHeader />
      </CartProvider>,
    );

    expect(screen.getByRole("link", { name: "Cửa hàng" })).toHaveAttribute(
      "href",
      "/cua-hang",
    );
    expect(screen.getByRole("link", { name: "DRONE VIET" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("button", { name: "Tìm kiếm" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Giỏ hàng (1)" })).toHaveAttribute(
      "href",
      "/gio-hang",
    );
    expect(screen.getByRole("banner")).toHaveClass("bg-[#071117]/94");
  });
});
