import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  getCurriculumItems,
  getDroneModels,
  getServices,
  getSiteContent,
} from "@/lib/content";
import { CurriculumCard } from "./curriculum-card";
import { DroneCard } from "./drone-card";
import { LabVisual } from "./lab-visual";
import { ServiceCard } from "./service-card";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

describe("shared site components", () => {
  it("renders navigation and the primary solution CTA", () => {
    const site = getSiteContent();

    render(
      <SiteHeader
        brandName={site.brand.name}
        navigation={site.navigation}
        primaryCta={site.hero.primaryCta}
      />,
    );

    expect(screen.getByRole("link", { name: "Drone Việt" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("button", { name: "Đào tạo & Chứng chỉ" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cửa hàng" })).toHaveAttribute(
      "href",
      "/cua-hang",
    );
    expect(
      screen.getByRole("link", { name: "Liên hệ tư vấn ngay" }),
    ).toHaveAttribute("href", "https://zalo.me/0384070636");
    expect(
      screen.getByRole("link", { name: "Liên hệ tư vấn ngay" }),
    ).toHaveAttribute("target", "_blank");
  });

  it("renders localized English site chrome", () => {
    const site = getSiteContent("en");

    render(
      <>
        <SiteHeader
          brandName={site.brand.name}
          navigation={site.navigation}
          primaryCta={site.hero.primaryCta}
          homeHref="/en"
          locale="en"
        />
        <SiteFooter
          brandName={site.brand.name}
          tagline={site.brand.description}
          navigation={site.navigation}
          locale="en"
        />
      </>,
    );

    expect(screen.getByRole("link", { name: "Drone Viet" })).toHaveAttribute(
      "href",
      "/en",
    );
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByText("Research & education systems")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us now" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("renders featured drone, curriculum, service, and lab visual cards", () => {
    const site = getSiteContent();
    const drone = getDroneModels()[0];
    const curriculum = getCurriculumItems()[0];
    const service = getServices()[0];

    render(
      <>
        <LabVisual metrics={site.hero.metrics} />
        <DroneCard drone={drone} />
        <CurriculumCard item={curriculum} />
        <ServiceCard service={service} />
      </>,
    );

    expect(screen.getByText("Lab telemetry")).toBeInTheDocument();
    expect(screen.getByText("DV Primary Lab")).toBeInTheDocument();
    expect(
      screen.getByText("Drone nhập môn cho cấp 1"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Tư vấn phòng lab drone nghiên cứu & giáo dục"),
    ).toBeInTheDocument();
  });

  it("uses localized destinations for English curriculum and service cards", () => {
    const curriculum = getCurriculumItems("en")[0];
    const service = getServices("en")[0];

    render(
      <CurriculumCard
        item={curriculum}
        href={`/en/curriculum#${curriculum.slug}`}
      />,
    );
    expect(
      screen.getByRole("link", { name: curriculum.downloadLabel }),
    ).toHaveAttribute("href", `/en/curriculum#${curriculum.slug}`);

    cleanup();
    render(
      <ServiceCard
        service={service}
        href={`/en/services#${service.slug}`}
      />,
    );
    expect(screen.getByRole("link", { name: service.ctaLabel })).toHaveAttribute(
      "href",
      `/en/services#${service.slug}`,
    );
  });
});
