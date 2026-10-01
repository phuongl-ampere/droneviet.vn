import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CheckoutResultPage from "./page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("order=DV-COD0001"),
}));

describe("CheckoutResultPage", () => {
  it("shows the created order number and a tracking destination", () => {
    render(<CheckoutResultPage />);

    expect(
      screen.getByRole("heading", { name: "Đơn hàng đã được tạo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("DV-COD0001")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Theo dõi đơn hàng" }),
    ).toHaveAttribute("href", "/theo-doi-don?order=DV-COD0001");
  });
});
