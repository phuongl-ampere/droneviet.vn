import { render, screen } from "@testing-library/react";
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

    expect(
      screen.getByRole("button", { name: "Đào tạo & Chứng chỉ" }),
    ).toBeInTheDocument();
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
