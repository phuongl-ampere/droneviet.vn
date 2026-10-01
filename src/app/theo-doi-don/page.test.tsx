import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TrackOrderPage from "./page";

const { findGuestOrder, resumePayosPayment } = vi.hoisted(() => ({
  findGuestOrder: vi.fn(),
  resumePayosPayment: vi.fn(),
}));

vi.mock("@/lib/commerce/orders", () => ({
  findGuestOrder,
  resumePayosPayment,
}));

describe("TrackOrderPage", () => {
  beforeEach(() => {
    findGuestOrder.mockReset();
    resumePayosPayment.mockReset();
  });

  it("renders guest order tracking fields", () => {
    render(<TrackOrderPage />);

    expect(
      screen.getByRole("heading", { name: "Theo dõi đơn hàng" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Mã đơn hàng")).toBeInTheDocument();
    expect(screen.getByLabelText("Số điện thoại")).toBeInTheDocument();
  });

  it("offers a pending guest PayOS order a way to resume payment", async () => {
    findGuestOrder.mockResolvedValue({
      orderNumber: "DV-PAY0001",
      paymentMethod: "payos",
      status: "pending_payment",
      totalVnd: 9_500_000,
    });
    render(<TrackOrderPage />);

    fireEvent.change(screen.getByLabelText("Mã đơn hàng"), {
      target: { value: "DV-PAY0001" },
    });
    fireEvent.change(screen.getByLabelText("Số điện thoại"), {
      target: { value: "0900000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tra cứu đơn" }));

    expect(
      await screen.findByRole("button", {
        name: "Tiếp tục thanh toán PayOS",
      }),
    ).toBeInTheDocument();
  });
});
