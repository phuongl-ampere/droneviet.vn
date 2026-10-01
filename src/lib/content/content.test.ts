import { describe, expect, it } from "vitest";
import {
  getArticleBySlug,
  getArticles,
  getCurriculumItems,
  getDroneModels,
  getPartners,
  getServices,
  getSiteContent,
} from "./index";

describe("content loaders", () => {
  it("loads landing content with the primary solution CTA", () => {
    const site = getSiteContent();

    expect(site.brand.name).toBe("Drone Việt");
    expect(site.hero.primaryCta.label).toBe("Liên hệ tư vấn ngay");
    expect(site.hero.primaryCta.href).toBe("https://zalo.me/0384070636");
    expect(site.hero.title).toBe(
      "Drone cho nghiên cứu và giáo dục từ cấp 1 đến đại học",
    );
    expect(site.navigation.map((item) => item.label)).toEqual([
      "Giải pháp",
      "Sản phẩm",
      "Giáo trình",
      "Dịch vụ",
      "Tin tức",
    ]);
    expect(site.audiencePaths.map((path) => path.name)).toEqual([
      "Trường phổ thông",
      "Đại học và lab nghiên cứu",
      "Trung tâm STEM",
    ]);
  });

  it("loads featured drone models for education and research use cases", () => {
    const drones = getDroneModels();

    expect(drones).toHaveLength(5);
    expect(drones.filter((drone) => drone.featured)).toHaveLength(4);
    expect(drones[0]).toMatchObject({
      slug: "dv-primary-lab",
      level: "Cấp 1",
    });
    expect(drones.flatMap((drone) => drone.learningOutcomes)).toContain(
      "Lập trình bay cơ bản theo khối lệnh",
    );
    expect(drones.map((drone) => drone.level)).toContain("Đại học");
  });

  it("loads curriculum items across learning levels", () => {
    const curriculum = getCurriculumItems();

    expect(curriculum.map((item) => item.level)).toEqual([
      "Cấp 1",
      "Cấp 2",
      "Cấp 3",
      "Đại học",
      "Nghiên cứu",
    ]);
    expect(curriculum.every((item) => item.status === "Đã hoàn thành")).toBe(
      true,
    );
  });

  it("loads services and partners for the brand website", () => {
    expect(getServices()).toHaveLength(6);
    expect(getPartners()).toHaveLength(4);
  });

  it("loads markdown article summaries and full article content by slug", () => {
    const articles = getArticles();
    const article = getArticleBySlug("drone-giao-duc-stem");

    expect(articles.map((item) => item.slug)).toContain(
      "drone-giao-duc-stem",
    );
    expect(articles[0]).not.toHaveProperty("content");
    expect(article?.title).toBe("Drone trong lớp học STEM và nghiên cứu ứng dụng");
    expect(article?.content).toContain("Drone giúp lớp học STEM");
    expect(getArticleBySlug("khong-ton-tai")).toBeNull();
  });

  it("loads English site content and articles", () => {
    const site = getSiteContent("en");
    const articles = getArticles("en");
    const article = getArticleBySlug("drone-stem-research", "en");

    expect(site.brand.name).toBe("Drone Viet");
    expect(site.navigation.map((item) => item.href)).toContain("/en/products");
    expect(site.hero.primaryCta.label).toBe("Contact us now");
    expect(getDroneModels("en")[0].level).toBe("Grade 1");
    expect(getServices("en")[0].title).toBe("Drone lab consulting");
    expect(articles.map((item) => item.slug)).toContain("drone-stem-research");
    expect(article?.title).toBe("Drones in STEM classrooms and applied research");
  });
});
