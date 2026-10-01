import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CheckoutPage from "./page";
import { CartProvider } from "@/components/store/cart-provider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

describe("CheckoutPage", () => {
  it("renders the first checkout step for a populated cart", () => {
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
        <CheckoutPage />
      </CartProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Thanh toán" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Thông tin nhận hàng" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nhận tại showroom")).not.toBeChecked();
    expect(screen.getAllByText(/9\.500\.000\s*₫/).length).toBeGreaterThan(0);
  });
});
