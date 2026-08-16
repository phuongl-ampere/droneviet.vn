import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CheckoutPage from "./page";
import { CartProvider } from "@/components/store/cart-provider";

describe("CheckoutPage", () => {
  it("renders contact and payment fields for a populated cart", () => {
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
    expect(screen.getByLabelText("Họ và tên")).toBeInTheDocument();
    expect(screen.getByLabelText("PayOS")).toBeChecked();
    expect(screen.getAllByText(/9\.500\.000\s*₫/).length).toBeGreaterThan(0);
  });
});
