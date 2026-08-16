import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DroneHeroCarousel } from "./drone-hero-carousel";

describe("DroneHeroCarousel", () => {
  it("renders three image slides and allows manual slide selection", () => {
    render(
      <DroneHeroCarousel
        eyebrow="Drone Việt"
        title="Đào tạo và thiết bị drone"
        description="Hero carousel test"
        primaryCta={{ href: "/dang-nhap", label: "Đăng ký" }}
        secondaryCta={{ href: "/cua-hang", label: "Khám phá" }}
      />,
    );

    expect(screen.getByTestId("drone-hero-carousel")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Drone flight 1" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Chuyển tới ảnh 2" }));
    expect(screen.getByRole("img", { name: "Drone flight 2" })).toBeInTheDocument();
  });
});
