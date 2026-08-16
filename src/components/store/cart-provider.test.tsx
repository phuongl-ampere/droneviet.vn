import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CartPage from "@/app/gio-hang/page";
import { CartProvider } from "./cart-provider";

describe("CartProvider", () => {
  it("shows a cart total and removes a cart line", () => {
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
        <CartPage />
      </CartProvider>,
    );

    expect(screen.getAllByText(/9\.500\.000\s*₫/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Xóa DV Primary Lab" }));
    expect(screen.getByText("Giỏ hàng đang trống.")).toBeInTheDocument();
  });
});
