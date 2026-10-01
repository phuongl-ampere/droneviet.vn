import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import { CustomerAccountMenu } from "./customer-account-menu";

const { logout, replace, useOptionalCustomerSession } = vi.hoisted(() => ({
  logout: vi.fn(),
  replace: vi.fn(),
  useOptionalCustomerSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("./customer-session-provider", () => ({
  useOptionalCustomerSession,
}));

describe("CustomerAccountMenu", () => {
  it("shows the sign-in link for a visitor", () => {
    useOptionalCustomerSession.mockReturnValue(null);

    render(
      <I18nProvider locale="vi">
        <CustomerAccountMenu loginHref="/dang-nhap" accountHref="/tai-khoan" />
      </I18nProvider>,
    );

    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute(
      "href",
      "/dang-nhap",
    );
  });

  it("opens account and logout actions for a signed-in customer", async () => {
    useOptionalCustomerSession.mockReturnValue({
      logout,
      user: {
        displayName: "Drone Viet Customer",
        email: "user@droneviet.vn",
        id: "customer-1",
        phone: null,
        roles: ["customer"],
      },
    });

    render(
      <I18nProvider locale="vi">
        <CustomerAccountMenu loginHref="/dang-nhap" accountHref="/tai-khoan" />
      </I18nProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Tài khoản khách hàng" }),
    );

    expect(
      screen.getByRole("menuitem", { name: "Tài khoản của bạn" }),
    ).toHaveAttribute("href", "/tai-khoan");
    fireEvent.click(screen.getByRole("menuitem", { name: "Đăng xuất" }));

    await waitFor(() => {
      expect(logout).toHaveBeenCalledOnce();
      expect(replace).toHaveBeenCalledWith("/dang-nhap");
    });
  });
});
