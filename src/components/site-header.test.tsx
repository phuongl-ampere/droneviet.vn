import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders the six-pillar navigation and its child destinations", () => {
    render(
      <SiteHeader
        brandName="Drone Việt"
        navigation={[]}
        primaryCta={{ href: "/bao-gia", label: "Tư vấn" }}
      />,
    );

    const headerContent = screen.getByRole("banner").firstElementChild;
    expect(headerContent).toHaveClass(
      "min-h-14",
      "lg:grid",
      "lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
    );
    expect(screen.getByTestId("site-brand-logo")).toHaveAttribute(
      "src",
      expect.stringContaining("logo.png"),
    );
    expect(
      screen.getByRole("button", { name: /Đào tạo/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Điều hướng chính" }),
    ).toHaveClass("lg:justify-self-center");
    const storeLink = screen.getByRole("link", { name: "Cửa hàng" });
    expect(storeLink).toHaveAttribute("href", "/cua-hang");
    expect(storeLink).toHaveClass(
      "border",
      "border-white",
      "rounded-full",
      "px-2",
      "py-1",
      "text-white",
    );
    const storeDropdown = screen.getByTestId("site-store-dropdown");
    expect(
      screen.getByRole("navigation", { name: "Điều hướng chính" })
        .lastElementChild,
    ).toBe(storeDropdown);
    expect(storeDropdown).toHaveClass("group", "relative");
    expect(
      within(storeDropdown).getByRole("link", { name: "Drone" }),
    ).toHaveAttribute("href", "/cua-hang?category=drone");
    expect(
      within(storeDropdown).getByRole("link", {
        name: "Phụ kiện & Linh kiện",
      }),
    ).toHaveAttribute("href", "/cua-hang?category=parts");
    expect(
      within(storeDropdown).getByRole("link", { name: "Drone giáo dục" }),
    ).toHaveAttribute("href", "/cua-hang?category=education");
    expect(
      screen
        .getAllByRole("link", { name: "Đăng ký khóa học" })
        .some(
          (link) =>
            link.getAttribute("href") ===
            "/dao-tao-chung-chi/dang-ky-khoa-hoc",
        ),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", {
          name: "Bản đồ khu vực cấm/hạn chế bay",
        })
        .some(
          (link) =>
            link.getAttribute("href") === "/bay-hop-phap/ban-do-cam-bay",
        ),
    ).toBe(true);
    expect(screen.getByRole("link", { name: "Tư vấn" })).toHaveAttribute(
      "href",
      "/bao-gia",
    );
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute(
      "href",
      "/dang-nhap",
    );
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveClass(
      "min-h-8",
      "px-2",
    );
    expect(screen.getByRole("link", { name: "Tư vấn" })).toHaveClass(
      "min-h-8",
      "px-2.5",
      "text-[11px]",
    );
    expect(screen.getByTestId("consultation-zalo-badge")).toHaveClass(
      "consultation-zalo-badge",
    );
    expect(screen.getByTestId("consultation-zalo-icon")).toHaveAttribute(
      "src",
      expect.stringContaining("zalo-icon.svg"),
    );
    expect(screen.getByText("Đào tạo · Giáo dục")).toBeInTheDocument();

    const mobileMenuButton = screen.getByRole("button", {
      name: "Mở menu",
    });
    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("navigation", {
        name: "Điều hướng trên điện thoại",
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(mobileMenuButton);

    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "true");
    const mobileNavigation = screen.getByRole("navigation", {
      name: "Điều hướng trên điện thoại",
    });
    expect(mobileNavigation).toHaveClass(
      "justify-items-center",
      "text-center",
      "lg:hidden",
    );
    expect(
      within(mobileNavigation).getByText("Đào tạo").closest("details"),
    ).toHaveClass("w-full", "text-center");
  });

  it("renders the same six navigation groups in English with localized destinations", () => {
    render(
      <SiteHeader
        brandName="Drone Viet"
        navigation={[]}
        primaryCta={{ href: "/en/quote", label: "Request a quote" }}
        homeHref="/en"
        locale="en"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Training" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Education drones" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Store" })).toHaveAttribute(
      "href",
      "/en/store",
    );
    expect(
      within(screen.getByTestId("site-store-dropdown")).getByRole("link", {
        name: "Accessories and parts",
      }),
    ).toHaveAttribute("href", "/en/store?category=parts");
    expect(
      screen
        .getAllByRole("link", { name: "Drone pilot certification" })
        .some(
          (link) =>
            link.getAttribute("href") ===
            "/en/topics/dao-tao-chung-chi/chung-chi-lai-drone",
        ),
    ).toBe(true);
  });
});
