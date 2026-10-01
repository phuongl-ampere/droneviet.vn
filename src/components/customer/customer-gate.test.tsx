import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import { CustomerGate } from "./customer-gate";

const { loginCustomer, replace, setUser, useCustomerSession } = vi.hoisted(
  () => ({
    loginCustomer: vi.fn(),
    replace: vi.fn(),
    setUser: vi.fn(),
    useCustomerSession: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/components/customer/customer-session-provider", () => ({
  useCustomerSession,
}));

vi.mock("@/lib/commerce/customer-auth", () => ({
  loginCustomer,
  registerCustomer: vi.fn(),
}));

describe("CustomerGate", () => {
  beforeEach(() => {
    loginCustomer.mockReset();
    replace.mockReset();
    setUser.mockReset();
    useCustomerSession.mockReturnValue({ setUser });
    loginCustomer.mockResolvedValue({
      accessToken: "access-token",
      user: {
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: null,
        roles: ["customer"],
      },
    });
    window.history.replaceState({}, "", "/dang-nhap");
  });

  function renderLogin() {
    const { container } = render(
      <I18nProvider locale="vi">
        <CustomerGate mode="login" />
      </I18nProvider>,
    );
    const form = container.querySelector("form");

    if (!form) {
      throw new Error("LOGIN_FORM_MISSING");
    }

    return form;
  }

  function submitLogin(form: HTMLFormElement) {
    fireEvent.change(form.elements.namedItem("email") as HTMLInputElement, {
      target: { value: "customer@example.vn" },
    });
    fireEvent.change(form.elements.namedItem("password") as HTMLInputElement, {
      target: { value: "password-long-enough" },
    });
    fireEvent.submit(form);
  }

  it("returns a customer to the requested local checkout after login", async () => {
    window.history.replaceState({}, "", "/dang-nhap?next=%2Fthanh-toan");

    submitLogin(renderLogin());

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/thanh-toan");
    });
  });

  it("rejects a protocol-relative external next path after login", async () => {
    window.history.replaceState({}, "", "/dang-nhap?next=%2F%2Fevil.example");

    submitLogin(renderLogin());

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/tai-khoan");
    });
  });

  it("rejects a backslash-based external next path after login", async () => {
    window.history.replaceState({}, "", "/dang-nhap?next=%2F%5C%5Cevil.example");

    submitLogin(renderLogin());

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/tai-khoan");
    });
  });
});
