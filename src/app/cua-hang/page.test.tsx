import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider } from "@/components/store/cart-provider";
import StorePage from "./page";

describe("StorePage", () => {
  it("renders commerce categories and direct-purchase products", async () => {
    render(<CartProvider>{await StorePage({})}</CartProvider>);

    expect(
      screen.getByRole("heading", { name: "Cửa hàng Drone Việt" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "DV Primary Lab" })
        .some((link) => link.getAttribute("href") === "/san-pham/dv-primary-lab"),
    ).toBe(true);
    expect(screen.getByText(/9\.500\.000\s*₫/)).toBeInTheDocument();
    expect(screen.getAllByText("Báo giá lab")).toHaveLength(2);
  });
});
