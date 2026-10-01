import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import { CartProvider } from "./cart-provider";
import { StoreHeader } from "./store-header";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

describe("StoreHeader", () => {
  it("shows commerce navigation, search, and current cart count", () => {
    render(
      <I18nProvider locale="vi">
        <CartProvider
          initialLines={[
            {
              priceVnd: 9_500_000,
              quantity: 1,
              slug: "dv-primary-lab",
              title: "DV Primary Lab",
            },
          ]}
        >
          <StoreHeader />
        </CartProvider>
      </I18nProvider>,
    );

    expect(
      screen.queryByRole("link", { name: "Cửa hàng" }),
    ).not.toBeInTheDocument();
    const brandLink = screen.getByRole("link", { name: "DRONE VIET" });
    expect(brandLink).toHaveAttribute("href", "/");
    expect(brandLink).toHaveClass("group", "gap-2", "sm:gap-3.5");
    const mobileMenuButton = screen.getByRole("button", {
      name: "Mở menu",
    });
    expect(mobileMenuButton.parentElement).toBe(brandLink.parentElement);
    const headerContent = screen.getByRole("banner").firstElementChild;
    expect(headerContent).toHaveClass(
      "min-h-14",
      "lg:grid",
      "lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
    );
    expect(
      screen.getByRole("navigation", { name: "Điều hướng cửa hàng" }),
    ).toHaveClass(
      "lg:justify-self-center",
    );
    expect(screen.getByTestId("store-brand-logo")).toHaveAttribute(
      "src",
      expect.stringContaining("logo.png"),
    );
    expect(screen.getByRole("button", { name: "Tìm kiếm" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Giỏ hàng (1)" })).toHaveAttribute(
      "href",
      "/gio-hang",
    );
    expect(screen.queryByRole("link", { name: "Tư vấn" })).not.toBeInTheDocument();
    const signInLink = screen.getByRole("link", { name: "Đăng nhập" });
    expect(signInLink).toHaveAttribute("href", "/dang-nhap");
    expect(signInLink).toHaveClass("rounded-full");
    const actions = screen.getByRole("banner").querySelector(":scope > div > div:last-child");
    expect(actions?.firstElementChild).toHaveAttribute("aria-label", "Tìm kiếm");
    expect(actions?.children[2]).toHaveAttribute("aria-label", "Giỏ hàng (1)");

    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));

    expect(
      screen.getByTestId("store-inline-search"),
    ).toHaveClass("h-10", "sm:flex");
    expect(
      screen.getByTestId("store-inline-search").querySelector("input"),
    ).toHaveClass("w-44");
    expect(
      screen.queryByRole("form", { name: "Tìm thiết bị" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveClass("bg-[#071117]/94");

    fireEvent.click(mobileMenuButton);

    expect(
      screen.getByRole("navigation", {
        name: "Điều hướng cửa hàng trên điện thoại",
      }),
    ).toBeInTheDocument();
  });

  it("uses English commerce destinations under the English locale", () => {
    render(
      <I18nProvider locale="en">
        <CartProvider>
          <StoreHeader locale="en" />
        </CartProvider>
      </I18nProvider>,
    );

    expect(screen.queryByRole("link", { name: "Store" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cart (0)" })).toHaveAttribute(
      "href",
      "/en/cart",
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/en/login",
    );
  });
});
