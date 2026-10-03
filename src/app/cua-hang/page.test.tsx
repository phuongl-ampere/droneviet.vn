import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CartProvider } from "@/components/store/cart-provider";
import StorePage from "./page";

describe("StorePage", () => {
  afterEach(cleanup);

  it("renders commerce categories and direct-purchase products", async () => {
    render(<CartProvider>{await StorePage({})}</CartProvider>);

    expect(
      screen.getByRole("heading", { name: "Cửa hàng Drone Việt" }),
    ).toHaveClass("sr-only");
    expect(screen.queryByText("Drone Viet Store")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Thiết bị drone, kit phòng lab và khóa học được cấu hình cho từng giai đoạn học tập và nghiên cứu.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "DV Primary Lab" })
        .some((link) => link.getAttribute("href") === "/san-pham/dv-primary-lab"),
    ).toBe(true);
    expect(screen.getByText(/9\.500\.000\s*₫/)).toBeInTheDocument();
    expect(screen.getAllByText("Báo giá lab").length).toBeGreaterThan(1);
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
