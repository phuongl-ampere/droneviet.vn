import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CartProvider } from "@/components/store/cart-provider";
import StorePage from "./page";

describe("StorePage", () => {
  afterEach(cleanup);

  it("renders commerce categories and direct-purchase products", async () => {
    render(<CartProvider>{await StorePage({})}</CartProvider>);

    expect(
      screen.getByRole("heading", { name: "Cửa hàng Drone Việt" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("drone-hero-carousel")).toHaveClass(
      "hero-carousel--compact",
    );
    expect(
      screen
        .getAllByRole("link", { name: "DV Primary Lab" })
        .some((link) => link.getAttribute("href") === "/san-pham/dv-primary-lab"),
    ).toBe(true);
    expect(screen.getByText(/9\.500\.000\s*₫/)).toBeInTheDocument();
    const categoryNavigation = screen.getByRole("navigation", {
      name: "Danh mục sản phẩm",
    });
    expect(categoryNavigation).toBeInTheDocument();
    expect(screen.getByTestId("store-category-sidebar")).toHaveClass(
      "sticky",
      "top-14",
    );
    expect(
      screen
        .getAllByRole("link", { name: "Cấp 2" })
        .some((link) => link.getAttribute("href") === "/cua-hang?learningStage=secondary"),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Đại học & R&D" })
        .some((link) => link.getAttribute("href") === "/cua-hang?learningStage=university"),
    ).toBe(true);
    expect(within(categoryNavigation).queryByText("Tình trạng")).not.toBeInTheDocument();
    expect(within(categoryNavigation).queryByText("Báo giá lab")).not.toBeInTheDocument();
  });

  it("filters rendered products from the store search query", async () => {
    render(
      <CartProvider>
        {await StorePage({
          searchParams: Promise.resolve({ q: "telemetry" }),
        })}
      </CartProvider>,
    );

    expect(screen.getByText("DV AI Vision")).toBeInTheDocument();
    expect(screen.getByText("DV Research Platform")).toBeInTheDocument();
    expect(screen.queryByText("DV Primary Lab")).not.toBeInTheDocument();
  });
});
