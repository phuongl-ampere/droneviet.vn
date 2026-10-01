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

  it("links quote-only courses to the canonical solution page", async () => {
    render(
      <CartProvider>
        {await CourseDetailPage({
          params: Promise.resolve({ slug: "phuong-phap-nghien-cuu-voi-drone" }),
        })}
      </CartProvider>,
    );

    expect(screen.getByRole("link", { name: "Trao đổi triển khai" })).toHaveAttribute(
      "href",
      "/dich-vu#tu-van-phong-lab",
    );
  });
});
