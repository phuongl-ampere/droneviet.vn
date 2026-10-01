import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider, useCart } from "./cart-provider";

function CartControls() {
  const { clearCart, lineCount } = useCart();

  return (
    <>
      <span>{lineCount}</span>
      <button type="button" onClick={clearCart}>
        Clear cart
      </button>
    </>
  );
}

describe("CartProvider", () => {
  it("clears every cart line after a completed checkout", () => {
    render(
      <CartProvider
        initialLines={[
          {
            priceVnd: 9_500_000,
            quantity: 2,
            slug: "dv-primary-lab",
            title: "DV Primary Lab",
          },
        ]}
      >
        <CartControls />
      </CartProvider>,
    );

    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear cart" }));

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
