import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider } from "./store/cart-provider";
import { ProductDetail } from "./product-detail";
import { getDroneModels } from "@/lib/content";

describe("ProductDetail commerce purchase panel", () => {
  it("shows a direct-purchase price and cart action for checkout products", () => {
    const drone = getDroneModels("vi").find(
      (product) => product.slug === "dv-primary-lab",
    );

    if (!drone) {
      throw new Error("Expected DV Primary Lab fixture");
    }

    render(
      <CartProvider>
        <ProductDetail drone={drone} locale="vi" />
      </CartProvider>,
    );

    expect(screen.getByText(/9\.500\.000\s*₫/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Thêm vào giỏ" }),
    ).toBeInTheDocument();
  });
});
