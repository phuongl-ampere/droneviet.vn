import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import { DroneHeroCarousel } from "./drone-hero-carousel";

function renderCarousel() {
  return render(
    <I18nProvider locale="vi">
      <DroneHeroCarousel
        eyebrow="Drone Việt"
        title="Đào tạo và thiết bị drone"
        description="Hero carousel test"
        primaryCta={{ href: "/dang-nhap", label: "Đăng ký" }}
        secondaryCta={{ href: "/cua-hang", label: "Khám phá" }}
      />
    </I18nProvider>,
  );
}

describe("DroneHeroCarousel", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders three image slides and allows manual slide selection", () => {
    renderCarousel();

    expect(screen.getByTestId("drone-hero-carousel")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Chuyến bay drone 1" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("hero-carousel-controls")).toHaveClass(
      "right-5",
      "sm:right-8",
    );
    expect(screen.getByRole("button", { name: "Ảnh trước" })).toHaveClass(
      "hero-carousel-arrow",
      "size-7",
    );
    expect(screen.getByRole("button", { name: "Ảnh trước" })).not.toHaveClass(
      "border",
      "bg-[#071117]/15",
    );
    expect(screen.getByRole("button", { name: "Ảnh tiếp theo" })).toHaveClass(
      "hero-carousel-arrow",
      "size-7",
    );
    expect(screen.getByRole("tab", { name: "Chuyển tới ảnh 2" })).toHaveClass(
      "hero-carousel-progress-tab",
    );
    expect(screen.getByTestId("hero-progress-1")).toHaveClass(
      "hero-carousel-progress",
    );
    expect(screen.getByTestId("hero-image-1")).toHaveClass(
      "hero-carousel-image--active",
    );
    fireEvent.click(screen.getByRole("tab", { name: "Chuyển tới ảnh 2" }));
    expect(
      screen.getByRole("img", { name: "Chuyến bay drone 2" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("hero-progress-2")).toHaveClass(
      "hero-carousel-progress",
    );
  });

  it("advances automatically every four seconds", () => {
    vi.useFakeTimers();
    renderCarousel();

    act(() => {
      vi.advanceTimersByTime(4_000);
    });

    expect(
      screen.getByRole("img", { name: "Chuyến bay drone 2" }),
    ).toBeInTheDocument();
  });

  it("renders a compact hero without call-to-action links", () => {
    render(
      <I18nProvider locale="vi">
        <DroneHeroCarousel
          eyebrow="Drone Viet Store"
          title="Cửa hàng Drone Việt"
          description="Thiết bị drone cho giáo dục và nghiên cứu."
          variant="compact"
        />
      </I18nProvider>,
    );

    expect(screen.getByTestId("drone-hero-carousel")).toHaveClass(
      "hero-carousel--compact",
    );
    expect(
      screen.queryByRole("link", { name: "Liên hệ tư vấn ngay" }),
    ).not.toBeInTheDocument();
  });
});
