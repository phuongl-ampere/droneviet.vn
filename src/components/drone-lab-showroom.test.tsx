import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDroneModels, getSiteContent } from "@/lib/content";
import { DroneLabShowroom } from "./drone-lab-showroom";

describe("DroneLabShowroom", () => {
  it("renders the lab showroom contract, Zalo CTA, and drone stations", () => {
    const site = getSiteContent();
    const drones = getDroneModels();

    render(
      <DroneLabShowroom
        locale="vi"
        eyebrow={site.hero.eyebrow}
        title={site.hero.title}
        description={site.hero.description}
        primaryCta={site.hero.primaryCta}
        secondaryCta={site.hero.secondaryCta}
        drones={drones}
      />,
    );

    expect(screen.getByTestId("drone-lab-showroom")).toBeInTheDocument();
    expect(screen.getByTestId("drone-lab-canvas-host")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Giải pháp drone cho giáo dục và nghiên cứu",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Tư vấn ngay" }),
    ).toHaveAttribute("href", "https://zalo.me/0384070636");
    expect(
      screen.getByRole("link", { name: "Tư vấn ngay" }),
    ).toHaveAttribute("target", "_blank");
    expect(screen.getByText("DV Primary Lab")).toBeInTheDocument();
    expect(screen.getByText("DV Code Fleet")).toBeInTheDocument();
    expect(screen.getByText("DV AI Vision")).toBeInTheDocument();
    expect(screen.getByText("Cấu hình đang giới thiệu")).toBeInTheDocument();
  });

  it("localizes the premium product placard", () => {
    const site = getSiteContent("en");

    render(
      <DroneLabShowroom
        locale="en"
        eyebrow={site.hero.eyebrow}
        title={site.hero.title}
        description={site.hero.description}
        primaryCta={site.hero.primaryCta}
        secondaryCta={site.hero.secondaryCta}
        drones={getDroneModels("en")}
      />,
    );

    expect(screen.getByText("Featured configuration")).toBeInTheDocument();
  });
});
