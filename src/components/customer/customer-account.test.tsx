import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import { CustomerAccount } from "./customer-account";

const {
  listOwnOrders,
  logout,
  replace,
  resumePayosPayment,
  setUser,
  updateProfile,
  useCustomerSession,
} = vi.hoisted(
  () => ({
    listOwnOrders: vi.fn(),
    logout: vi.fn(),
    replace: vi.fn(),
    resumePayosPayment: vi.fn(),
    setUser: vi.fn(),
    updateProfile: vi.fn(),
    useCustomerSession: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/components/customer/customer-session-provider", () => ({
  useCustomerSession,
}));

vi.mock("@/lib/commerce/customer-api", () => ({
  customerApi: {
    listOwnOrders,
    updateProfile,
  },
}));

describe("CustomerAccount", () => {
  beforeEach(() => {
    listOwnOrders.mockReset();
    logout.mockReset();
    replace.mockReset();
    resumePayosPayment.mockReset();
    setUser.mockReset();
    updateProfile.mockReset();
    useCustomerSession.mockReturnValue({
      error: null,
      loading: false,
      logout,
      refresh: vi.fn(),
      setUser,
      user: {
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: null,
        roles: ["customer"],
      },
    });
  });

  it("shows the customer profile, private orders, and saves an edit", async () => {
    listOwnOrders.mockResolvedValue([
      {
        createdAt: "2026-08-17T00:00:00.000Z",
        id: "order-1",
        lines: [
          {
            id: "line-1",
            quantity: 1,
            title: "DV Primary Lab",
            unitPriceVnd: 9_500_000,
          },
        ],
        orderNumber: "DV-ORDER01",
        paymentMethod: "cod",
        status: "paid",
        totalVnd: 9_500_000,
      },
    ]);
    updateProfile.mockResolvedValue({
      displayName: "Nguyen Van B",
      email: "customer@example.vn",
      id: "customer-1",
      phone: "0901234567",
      roles: ["customer"],
    });

    render(
      <I18nProvider locale="vi">
        <CustomerAccount />
      </I18nProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Tài khoản của bạn" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("DV-ORDER01")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Chỉnh sửa hồ sơ" }),
    );
    fireEvent.change(screen.getByLabelText("Họ và tên"), {
      target: { value: "Nguyen Van B" },
    });
    fireEvent.change(screen.getByLabelText("Số điện thoại"), {
      target: { value: "0901234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        displayName: "Nguyen Van B",
        phone: "0901234567",
      });
    });
    expect(setUser).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: "Nguyen Van B" }),
    );
  });

  it("redirects signed-out visitors to customer login", async () => {
    useCustomerSession.mockReturnValueOnce({
      error: null,
      loading: false,
      logout,
      refresh: vi.fn(),
      setUser,
      user: null,
    });

    render(
      <I18nProvider locale="vi">
        <CustomerAccount />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dang-nhap?next=/tai-khoan");
    });
  });

  it("shows a resume payment action only for the customer's pending PayOS order", async () => {
    listOwnOrders.mockResolvedValue([
      {
        createdAt: "2026-08-17T00:00:00.000Z",
        id: "order-1",
        lines: [],
        orderNumber: "DV-PAY0001",
        paymentMethod: "payos",
        status: "pending_payment",
        totalVnd: 9_500_000,
      },
    ]);

    render(
      <I18nProvider locale="vi">
        <CustomerAccount />
      </I18nProvider>,
    );

    expect(
      await screen.findByRole("button", { name: "Tiếp tục thanh toán PayOS" }),
    ).toBeInTheDocument();
  });
});
