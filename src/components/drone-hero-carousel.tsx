"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";

type LinkItem = {
  href: string;
  label: string;
};

type DroneHeroCarouselVariant = "compact" | "default";

const slides = [
  { image: "/store/quadcopter-flight-01.jpg" },
  { image: "/store/quadcopter-flight-02.jpg" },
  { image: "/store/quadcopter-flight-03.jpg" },
];

export function DroneHeroCarousel({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = "default",
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: LinkItem;
  secondaryCta?: LinkItem;
  variant?: DroneHeroCarouselVariant;
}) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const isCompact = variant === "compact";
  const primaryExternal = primaryCta?.href.startsWith("http");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4_000);

    return () => window.clearTimeout(timer);
  }, [index]);

  return (
    <section
      data-testid="drone-hero-carousel"
      aria-roledescription="carousel"
      aria-label={t("carousel.label")}
      className={`relative overflow-hidden bg-[#006D66] text-white ${
        isCompact
          ? "hero-carousel--compact min-h-[22rem] sm:min-h-[24rem]"
          : "min-h-[min(780px,calc(100svh-56px))]"
      }`}
    >
      {slides.map((item, slideIndex) => (
        <Image
          key={item.image}
          alt={
            slideIndex === index
              ? t("carousel.slideAlt", { count: slideIndex + 1 })
              : ""
          }
          aria-hidden={slideIndex === index ? undefined : true}
          fill
          priority={slideIndex === 0}
          sizes="100vw"
          src={item.image}
          data-testid={`hero-image-${slideIndex + 1}`}
          className={`hero-carousel-image object-cover transition-opacity duration-700 ${
            slideIndex === index
              ? "hero-carousel-image--active opacity-100"
              : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,47,44,0.88),rgba(0,80,74,0.52)_48%,rgba(0,0,0,0.2))]" />

      <div
        className={`relative mx-auto flex max-w-7xl items-end px-5 sm:px-8 ${
          isCompact
            ? "min-h-[22rem] pb-24 pt-10 sm:min-h-[24rem] sm:py-12"
            : "min-h-[min(780px,calc(100svh-56px))] py-16 sm:py-24"
        }`}
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B5FFF8]">
            {eyebrow} · {String(index + 1).padStart(2, "0")} / 03
          </p>
          <h1
            className={`mt-4 font-semibold leading-[1.03] ${
              isCompact ? "text-3xl sm:text-5xl" : "text-5xl sm:text-7xl"
            }`}
          >
            {title}
          </h1>
          <p
            className={`max-w-2xl text-white/85 ${
              isCompact
                ? "mt-4 text-sm leading-6 sm:text-base sm:leading-7"
                : "mt-6 text-base leading-8 sm:text-lg"
            }`}
          >
            {description}
          </p>
          {primaryCta || secondaryCta ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  target={primaryExternal ? "_blank" : undefined}
                  rel={primaryExternal ? "noopener noreferrer" : undefined}
                  className="inline-flex min-h-12 items-center bg-white px-5 text-sm font-semibold text-[#006D66] hover:bg-[#D9FFFB]"
                >
                  {primaryCta.label}
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex min-h-12 items-center border border-white/50 px-5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div
        data-testid="hero-carousel-controls"
        className={`absolute right-5 flex items-center gap-2 sm:right-8 ${
          isCompact ? "bottom-5" : "bottom-7"
        }`}
      >
        <button
          type="button"
          aria-label={t("carousel.previous")}
          onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
          className="hero-carousel-arrow grid size-7 place-items-center text-white/65 transition hover:-translate-y-px hover:text-white focus-visible:text-white"
        >
          <ChevronLeft aria-hidden="true" size={14} />
        </button>
        <div
          className="flex gap-2"
          role="tablist"
          aria-label={t("carousel.selectImage")}
        >
          {slides.map((item, slideIndex) => (
            <button
              key={item.image}
              type="button"
              role="tab"
              aria-label={t("carousel.goToImage", { count: slideIndex + 1 })}
              aria-selected={slideIndex === index}
              onClick={() => setIndex(slideIndex)}
              className="hero-carousel-progress-tab relative h-1.5 w-8 overflow-hidden bg-white/40"
            >
              {slideIndex === index ? (
                <span
                  aria-hidden="true"
                  className="hero-carousel-progress absolute inset-0 origin-left bg-white"
                  data-testid={`hero-progress-${slideIndex + 1}`}
                />
              ) : null}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={t("carousel.next")}
          onClick={() => setIndex((current) => (current + 1) % slides.length)}
          className="hero-carousel-arrow grid size-7 place-items-center text-white/65 transition hover:-translate-y-px hover:text-white focus-visible:text-white"
        >
          <ChevronRight aria-hidden="true" size={14} />
        </button>
      </div>
    </section>
  );
}
