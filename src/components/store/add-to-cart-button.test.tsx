import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider } from "./cart-provider";
import { AddToCartButton } from "./add-to-cart-button";
import { StoreHeader } from "./store-header";

describe("AddToCartButton", () => {
  it("confirms the add action and updates the visible cart count", () => {
    render(
      <CartProvider>
        <StoreHeader />
        <AddToCartButton
          priceVnd={9_500_000}
          slug="dv-primary-lab"
          title="DV Primary Lab"
          variantId="variant-primary-lab"
        />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Thêm vào giỏ" }));

    expect(
      screen.getByRole("button", { name: "Đã thêm vào giỏ" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1", { selector: "span" })).toBeInTheDocument();
  });
});
