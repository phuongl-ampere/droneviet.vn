import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminWorkbench } from "./admin-workbench";

const { listAdminOrders, transitionAdminOrder } = vi.hoisted(() => ({
  listAdminOrders: vi.fn(),
  transitionAdminOrder: vi.fn(),
}));

vi.mock("@/lib/commerce/admin-api", () => ({
  createAdminArticle: vi.fn(),
  createAdminProduct: vi.fn(),
  listAdminOrders,
  loginAdmin: vi.fn(),
  publishAdminProductContent: vi.fn(),
  transitionAdminOrder,
}));

describe("AdminWorkbench", () => {
  it("lets an operator edit product pricing and preview an article in Markdown", () => {
    render(<AdminWorkbench />);

    expect(
      screen.getByRole("heading", { name: "Admin vận hành" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Giá VND")).toHaveValue(9_500_000);

    fireEvent.click(screen.getByRole("button", { name: "Bài viết" }));
    fireEvent.change(screen.getByLabelText("Nội dung Markdown"), {
      target: { value: "# Drone STEM\n\nNội dung khóa học." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xem trước" }));

    expect(
      screen.getByRole("heading", { name: "Drone STEM", level: 1 }),
    ).toBeInTheDocument();
  });

  it("lets operations move an order through an allowed next status", async () => {
    listAdminOrders.mockResolvedValue([
      {
        contactName: "Nguyen Van A",
        contactPhone: "0900000000",
        createdAt: "2026-08-16T10:00:00.000Z",
        id: "order-1",
        lines: [{ id: "line-1", quantity: 1, title: "DV Primary Lab" }],
        orderNumber: "DV-ORDER01",
        status: "paid",
        totalVnd: 9_500_000,
      },
    ]);
    transitionAdminOrder.mockResolvedValue({
      id: "order-1",
      status: "packing",
    });

    render(<AdminWorkbench accessToken="admin-token" />);
    fireEvent.click(screen.getByRole("button", { name: "Đơn hàng" }));

    expect(await screen.findByText("DV-ORDER01")).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Đã hủy" }),
    ).not.toBeInTheDocument();
    fireEvent.change(
      screen.getByLabelText("Trạng thái tiếp theo DV-ORDER01"),
      { target: { value: "packing" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Cập nhật đơn" }));

    await waitFor(() => {
      expect(transitionAdminOrder).toHaveBeenCalledWith(
        "admin-token",
        "order-1",
        "packing",
      );
    });
  });

  it("does not offer direct cancellation for a pending PayOS order", async () => {
    listAdminOrders.mockResolvedValue([
      {
        contactName: "Nguyen Van B",
        contactPhone: "0911111111",
        createdAt: "2026-08-16T10:00:00.000Z",
        id: "order-payos",
        lines: [{ id: "line-1", quantity: 1, title: "DV Primary Lab" }],
        orderNumber: "DV-PAYOS01",
        paymentMethod: "payos",
        status: "pending_payment",
        totalVnd: 9_500_000,
      },
    ]);

    render(<AdminWorkbench accessToken="admin-token" />);
    fireEvent.click(screen.getByRole("button", { name: "Đơn hàng" }));

    expect(await screen.findByText("DV-PAYOS01")).toBeInTheDocument();
    expect(screen.getByText("Không còn thao tác")).toBeInTheDocument();
  });
});
