import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import CartPage from "./page";

const { push, useCart, useCustomerSession } = vi.hoisted(() => ({
  push: vi.fn(),
  useCart: vi.fn(),
  useCustomerSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/components/customer/customer-session-provider", () => ({
  useCustomerSession,
}));

vi.mock("@/components/store/cart-provider", () => ({
  useCart,
}));

const customer = {
  displayName: "Nguyen Van A",
  email: "customer@example.vn",
  id: "customer-1",
  phone: null,
  roles: ["customer"],
};

function renderCart(locale: "en" | "vi") {
  return render(
    <I18nProvider locale={locale}>
      <CartPage />
    </I18nProvider>,
  );
}

describe("CartPage", () => {
  beforeEach(() => {
    push.mockReset();
    useCart.mockReturnValue({
      lineCount: 1,
      lines: [
        {
          priceVnd: 9_500_000,
          quantity: 1,
          slug: "dv-primary-lab",
          title: "DV Primary Lab",
        },
      ],
      removeLine: vi.fn(),
      totalVnd: 9_500_000,
    });
    useCustomerSession.mockReturnValue({
      loading: false,
      user: customer,
    });
  });

  it("sends a signed-out Vietnamese shopper to login when checkout is pressed", () => {
    useCustomerSession.mockReturnValue({ loading: false, user: null });

    renderCart("vi");
    fireEvent.click(
      screen.getByRole("button", { name: "Tiến hành checkout" }),
    );

    expect(push).toHaveBeenCalledWith("/dang-nhap?next=%2Fthanh-toan");
  });

  it("opens English checkout for a signed-in shopper", () => {
    renderCart("en");
    fireEvent.click(
      screen.getByRole("button", { name: "Proceed to checkout" }),
    );

    expect(push).toHaveBeenCalledWith("/en/checkout");
  });

  it("sends a signed-out English shopper to login when checkout is pressed", () => {
    useCustomerSession.mockReturnValue({ loading: false, user: null });

    renderCart("en");
    fireEvent.click(
      screen.getByRole("button", { name: "Proceed to checkout" }),
    );

    expect(push).toHaveBeenCalledWith("/en/login?next=%2Fen%2Fcheckout");
  });

  it("keeps the checkout action visible but disabled while the session loads", () => {
    useCustomerSession.mockReturnValue({ loading: true, user: null });

    renderCart("vi");

    expect(
      screen.getByRole("button", { name: "Tiến hành checkout" }),
    ).toBeDisabled();
  });
});
