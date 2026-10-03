import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { dronePillars } from "@/lib/drone-pillars";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("keeps the mobile header to one row until the menu is opened", () => {
    render(
      <SiteHeader
        brandName="Drone Việt"
        navigation={[]}
        primaryCta={{ href: "/bao-gia", label: "Tư vấn" }}
      />,
    );

    const desktopNavigation = screen.getByRole("navigation", {
      name: "Điều hướng chính",
    });
    const toggle = screen.getByRole("button", { name: "Mở menu" });

    expect(desktopNavigation).toHaveClass("min-[980px]:flex");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("navigation", {
        name: "Điều hướng trên điện thoại",
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);

    const mobileNavigation = screen.getByRole("navigation", {
      name: "Điều hướng trên điện thoại",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(mobileNavigation).toHaveAttribute("id", "mobile-navigation");
    const eventLink = within(mobileNavigation).getByRole("link", {
      name: "Event/trải nghiệm drone",
    });
    eventLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(eventLink);
    expect(
      screen.queryByRole("navigation", {
        name: "Điều hướng trên điện thoại",
      }),
    ).not.toBeInTheDocument();
  });

  it("renders five clear pillars and their relocated destinations", () => {
    render(
      <SiteHeader
        brandName="Drone Việt"
        navigation={[]}
        primaryCta={{ href: "/bao-gia", label: "Tư vấn" }}
      />,
    );

    expect(dronePillars.map((pillar) => pillar.slug)).toEqual([
      "dao-tao-chung-chi",
      "drone-giao-duc",
      "cua-hang",
      "bay-hop-phap",
      "kien-thuc-rd",
    ]);
    expect(dronePillars[0]?.items[0]?.slug).toBe("event-trai-nghiem");
    expect(
      dronePillars.find((pillar) => pillar.slug === "bay-hop-phap")?.title,
    ).toBe("Cấp phép bay");
    expect(screen.getByRole("navigation", { name: "Điều hướng chính" })).toHaveClass(
      "gap-2",
      "min-[1120px]:gap-4",
    );
    expect(screen.getByText("Research · Education")).toHaveClass(
      "min-[1120px]:block",
    );
    const dividers = screen.getAllByTestId("header-menu-divider");
    expect(dividers).toHaveLength(dronePillars.length - 1);
    dividers.forEach((divider) => {
      expect(divider).toHaveClass("h-3", "bg-[#eef1f2]/35");
    });
    expect(
      screen.getByRole("button", { name: /Đào tạo/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cửa hàng" })).toHaveAttribute(
      "href",
      "/cua-hang",
    );
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
    expect(
      screen
        .getAllByRole("link", { name: "Event/trải nghiệm drone" })
        .some(
          (link) =>
            link.getAttribute("href") ===
            "/dao-tao-chung-chi/event-trai-nghiem",
        ),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Workshop trường học" })
        .some(
          (link) =>
            link.getAttribute("href") ===
            "/drone-giao-duc/workshop-truong-hoc",
        ),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Tin tức drone" })
        .some(
          (link) =>
            link.getAttribute("href") === "/kien-thuc-rd/tin-tuc-drone",
        ),
    ).toBe(true);
    expect(screen.queryByText("Dịch vụ & Sự kiện")).not.toBeInTheDocument();
    expect(screen.queryByText("Demo lab")).not.toBeInTheDocument();
    expect(screen.queryByText("Tư vấn triển khai")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quản trị" })).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute(
      "href",
      "/dang-nhap",
    );
  });
});
