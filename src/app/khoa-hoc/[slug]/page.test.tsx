import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider } from "@/components/store/cart-provider";
import CourseDetailPage from "./page";

describe("CourseDetailPage", () => {
  it("offers a cart action for an individually purchasable course", async () => {
    render(
      <CartProvider>
        {await CourseDetailPage({
          params: Promise.resolve({ slug: "drone-nhap-mon-cap-1" }),
        })}
      </CartProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Thêm vào giỏ" }),
    ).toBeInTheDocument();
  });
});
