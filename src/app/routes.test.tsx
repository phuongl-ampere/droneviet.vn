import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";
import ServicesPage from "./dich-vu/page";
import CurriculumPage from "./giao-trinh/page";
import ProductsPage from "./san-pham/page";
import ArticlesPage from "./tin-tuc/page";
import ArticlePage, { generateStaticParams } from "./tin-tuc/[slug]/page";
import EnglishHomePage from "./en/page";
import EnglishProductsPage from "./en/products/page";
import EnglishNewsPage from "./en/news/page";

describe("public routes", () => {
  it("renders the landing page solution CTA and proof sections", async () => {
    render(await HomePage());

    expect(
      screen.getByRole("heading", {
        name: "Giải pháp drone cho giáo dục và nghiên cứu",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home-static-hero")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Giải pháp drone cho giáo dục và nghiên cứu",
      }),
    ).toHaveAttribute("src", expect.stringContaining("quadcopter-flight-01.jpg"));
    expect(screen.queryByTestId("drone-hero-carousel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hero-carousel-controls")).not.toBeInTheDocument();
    expect(screen.getAllByText("DV Primary Lab").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DV Research Platform").length).toBeGreaterThan(0);
    expect(screen.getByText("Danh mục giải pháp")).toBeInTheDocument();
    expect(screen.getByText("Dịch vụ")).toBeInTheDocument();
    expect(screen.getByText("Triển khai")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cửa hàng" })).toHaveAttribute(
      "href",
      "/cua-hang",
    );
    expect(screen.queryByText("Giáo trình và tài liệu đã hoàn thành")).not.toBeInTheDocument();
    expect(screen.queryByText("Hệ sinh thái đối tác giáo dục và nghiên cứu")).not.toBeInTheDocument();
    expect(screen.queryByText("Tin tức và học liệu mới")).not.toBeInTheDocument();
  });

  it("renders product, curriculum, all-solution, and article listing pages", async () => {
    render(await ProductsPage());
    expect(screen.getByRole("heading", { name: "Sản phẩm drone" })).toBeInTheDocument();
    expect(screen.getByText("DV Primary Lab")).toBeInTheDocument();
    expect(screen.getByText("DV Research Platform")).toBeInTheDocument();
    cleanup();

    render(await CurriculumPage());
    expect(
      screen.getByRole("heading", {
        name: "Giáo trình drone từ cấp 1 đến đại học",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Phương pháp nghiên cứu với drone"),
    ).toBeInTheDocument();
    cleanup();

    render(await ServicesPage());
    expect(
      screen.getByRole("heading", {
        name: "Tất cả giải pháp drone cho giáo dục và nghiên cứu",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("DV AI Vision")).toBeInTheDocument();
    expect(screen.getByText("DV Research Platform")).toBeInTheDocument();
    expect(
      screen.queryByText("Workshop và ngày hội trải nghiệm drone"),
    ).not.toBeInTheDocument();
    cleanup();

    render(await ArticlesPage());
    expect(screen.getByRole("heading", { name: "Tin tức và học liệu" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(
      screen.getByText("Drone trong lớp học STEM và nghiên cứu ứng dụng"),
    ).toBeInTheDocument();
  });

  it("renders article detail pages from markdown slugs", async () => {
    expect(await generateStaticParams()).toContainEqual({
      slug: "drone-giao-duc-stem",
    });

    render(
      await ArticlePage({
        params: Promise.resolve({ slug: "drone-giao-duc-stem" }),
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Drone trong lớp học STEM và nghiên cứu ứng dụng",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Thay vì chỉ học thuật toán trên màn hình/),
    ).toBeInTheDocument();
    expect(screen.getByText("2026-07-05").tagName).toBe("TIME");
    expect(screen.getByText("2026-07-05")).toHaveAttribute("dateTime", "2026-07-05");
  });

  it("renders English home, products, and news pages", async () => {
    render(await EnglishHomePage());
    expect(
      screen.getByRole("heading", {
        name: "Drone solutions for education and research",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home-static-hero")).toBeInTheDocument();
    expect(screen.queryByTestId("drone-hero-carousel")).not.toBeInTheDocument();
    expect(screen.getByText("A drone platform for every stage of learning")).toBeInTheDocument();
    expect(screen.getByText("From first flight to a working lab")).toBeInTheDocument();
    expect(screen.getByText("A clear path from brief to deployment")).toBeInTheDocument();
    cleanup();

    render(await EnglishProductsPage());
    expect(screen.getByRole("heading", { name: "Drone products" })).toBeInTheDocument();
    expect(screen.getByText("DV Research Platform")).toBeInTheDocument();
    cleanup();

    render(await EnglishNewsPage());
    expect(screen.getByRole("heading", { name: "News and resources" })).toBeInTheDocument();
    expect(
      screen.getByText("Drones in STEM classrooms and applied research"),
    ).toBeInTheDocument();
  });
});
