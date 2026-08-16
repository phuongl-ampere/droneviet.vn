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
      screen.getAllByRole("link", { name: "Đào tạo & Chứng chỉ" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "Đăng ký khóa học" }),
    ).toHaveAttribute("href", "/dao-tao-chung-chi/dang-ky-khoa-hoc");
    expect(
      screen.getByRole("link", { name: "Bản đồ khu vực cấm/hạn chế bay" }),
    ).toHaveAttribute("href", "/bay-hop-phap/ban-do-cam-bay");
  });
});
