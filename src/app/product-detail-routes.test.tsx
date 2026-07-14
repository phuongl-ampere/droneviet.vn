import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductDetailPage, {
  generateMetadata as generateViProductMetadata,
  generateStaticParams as generateViProductParams,
} from "./san-pham/[slug]/page";
import EnglishProductDetailPage, {
  generateMetadata as generateEnProductMetadata,
  generateStaticParams as generateEnProductParams,
} from "./en/products/[slug]/page";

describe("product detail routes", () => {
  it("renders Vietnamese product detail pages with SEO content", async () => {
    expect(await generateViProductParams()).toContainEqual({ slug: "dv-primary-lab" });

    const metadata = await generateViProductMetadata({
      params: Promise.resolve({ slug: "dv-primary-lab" }),
    });

    expect(metadata.title).toBe("DV Primary Lab");
    expect(metadata.alternates?.canonical).toBe("/san-pham/dv-primary-lab");

    render(
      await ProductDetailPage({
        params: Promise.resolve({ slug: "dv-primary-lab" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "DV Primary Lab" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("Lớp STEM nhập môn")).toBeInTheDocument();
    expect(screen.getByText("Câu hỏi thường gặp")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Thông số triển khai" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Liên hệ tư vấn ngay" })).toHaveAttribute(
      "href",
      "https://zalo.me/0384070636",
    );
  });

  it("renders English product detail pages with SEO content", async () => {
    expect(await generateEnProductParams()).toContainEqual({ slug: "dv-research-platform" });

    const metadata = await generateEnProductMetadata({
      params: Promise.resolve({ slug: "dv-research-platform" }),
    });

    expect(metadata.title).toBe("DV Research Platform");
    expect(metadata.alternates?.canonical).toBe("/en/products/dv-research-platform");

    render(
      await EnglishProductDetailPage({
        params: Promise.resolve({ slug: "dv-research-platform" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "DV Research Platform" })).toBeInTheDocument();
    expect(screen.getByText("Research lab")).toBeInTheDocument();
    expect(screen.getByText("Frequently asked questions")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us now" })).toHaveAttribute(
      "href",
      "https://zalo.me/0384070636",
    );
  });
});
