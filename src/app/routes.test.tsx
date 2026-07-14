import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";
import ServicesPage from "./dich-vu/page";
import SolutionsPage from "./giai-phap/page";
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
        name: "Drone cho nghiên cứu và giáo dục từ cấp 1 đến đại học",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Liên hệ tư vấn ngay" }),
    ).toHaveAttribute("href", "https://zalo.me/0384070636");
    expect(
      screen.getByRole("link", { name: "Liên hệ tư vấn ngay" }),
    ).toHaveAttribute("target", "_blank");
    expect(screen.getByTestId("drone-lab-showroom")).toBeInTheDocument();
    expect(screen.getAllByText("DV Primary Lab").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DV Research Platform").length).toBeGreaterThan(0);
    expect(screen.getByText("Solution catalog")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Deployment")).toBeInTheDocument();
    expect(screen.queryByText("Giáo trình và tài liệu đã hoàn thành")).not.toBeInTheDocument();
    expect(screen.queryByText("Hệ sinh thái đối tác giáo dục và nghiên cứu")).not.toBeInTheDocument();
    expect(screen.queryByText("Tin tức và học liệu mới")).not.toBeInTheDocument();
  });

  it("renders solution, product, curriculum, service, and article listing pages", async () => {
    render(await SolutionsPage());
    expect(
      screen.getByRole("heading", {
        name: "Giải pháp drone nghiên cứu & giáo dục",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("DV AI Vision")).toBeInTheDocument();
    expect(screen.getByText("DV Research Platform")).toBeInTheDocument();
    cleanup();

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
        name: "Dịch vụ drone nghiên cứu & giáo dục",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Workshop và ngày hội trải nghiệm drone")).toBeInTheDocument();
    expect(screen.getByText("Thiết kế nền tảng drone nghiên cứu")).toBeInTheDocument();
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
  });

  it("renders English home, products, and news pages", async () => {
    render(await EnglishHomePage());
    expect(
      screen.getByRole("heading", {
        name: "Drones for research and education from grade school to university",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us now" })).toHaveAttribute(
      "href",
      "https://zalo.me/0384070636",
    );
    expect(screen.getByTestId("drone-lab-showroom")).toBeInTheDocument();
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
