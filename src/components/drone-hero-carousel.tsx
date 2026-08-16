"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type LinkItem = {
  href: string;
  label: string;
};

const slides = [
  { alt: "Drone flight 1", image: "/store/quadcopter-flight-01.jpg" },
  { alt: "Drone flight 2", image: "/store/quadcopter-flight-02.jpg" },
  { alt: "Drone flight 3", image: "/store/quadcopter-flight-03.jpg" },
];

export function DroneHeroCarousel({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: LinkItem;
  secondaryCta: LinkItem;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const primaryExternal = primaryCta.href.startsWith("http");

  useEffect(() => {
    if (paused) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6_000);

    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = slides[index];

  return (
    <section
      data-testid="drone-hero-carousel"
      aria-roledescription="carousel"
      aria-label="Drone Việt"
      className="relative min-h-[min(780px,calc(100svh-80px))] overflow-hidden bg-[#006D66] text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Image
        key={slide.image}
        alt={slide.alt}
        fill
        priority
        sizes="100vw"
        src={slide.image}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,47,44,0.88),rgba(0,80,74,0.52)_48%,rgba(0,0,0,0.2))]" />

      <div className="relative mx-auto flex min-h-[min(780px,calc(100svh-80px))] max-w-7xl items-end px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B5FFF8]">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.03] sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={primaryCta.href}
              target={primaryExternal ? "_blank" : undefined}
              rel={primaryExternal ? "noopener noreferrer" : undefined}
              className="inline-flex min-h-12 items-center bg-white px-5 text-sm font-semibold text-[#006D66] hover:bg-[#D9FFFB]"
            >
              {primaryCta.label}
            </Link>
            <Link
              href={secondaryCta.href}
              className="inline-flex min-h-12 items-center border border-white/50 px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-7 left-5 flex items-center gap-3 sm:left-8">
        <button
          type="button"
          aria-label="Ảnh trước"
          onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
          className="grid size-10 place-items-center border border-white/40 hover:bg-white/10"
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <div className="flex gap-2" role="tablist" aria-label="Chọn ảnh hero">
          {slides.map((item, slideIndex) => (
            <button
              key={item.image}
              type="button"
              role="tab"
              aria-label={`Chuyển tới ảnh ${slideIndex + 1}`}
              aria-selected={slideIndex === index}
              onClick={() => setIndex(slideIndex)}
              className={`h-1.5 w-8 ${slideIndex === index ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Ảnh tiếp theo"
          onClick={() => setIndex((index + 1) % slides.length)}
          className="grid size-10 place-items-center border border-white/40 hover:bg-white/10"
        >
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>
    </section>
  );
}
