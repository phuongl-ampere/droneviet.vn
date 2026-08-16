import { describe, expect, it, vi } from "vitest";
import { ContentStatus } from "./entities/article.entity";
import { ContentService } from "./content.service";
import { MarkdownRendererService } from "./markdown-renderer.service";

describe("ContentService", () => {
  it("publishes an article with a new immutable Markdown revision", async () => {
    const articleRepository = {
      findOneByOrFail: vi.fn().mockResolvedValue({
        id: "article-drone-stem",
        revisionNumber: 2,
      }),
      save: vi.fn(async (article) => article),
    };
    const revisionRepository = {
      create: vi.fn((revision) => revision),
      save: vi.fn(async (revision) => revision),
    };
    const markdownRenderer = {
      render: vi.fn().mockResolvedValue({
        html: "<h1 id=\"drone-stem\">Drone STEM</h1>",
        tableOfContents: [{ depth: 1, id: "drone-stem", text: "Drone STEM" }],
      }),
    } as unknown as MarkdownRendererService;
    const service = new ContentService(
      articleRepository as never,
      revisionRepository as never,
      markdownRenderer,
    );

    const result = await service.publishArticle("article-drone-stem", {
      bodyMarkdown: "# Drone STEM",
      seoDescription: "Học drone STEM",
      summary: "Giáo trình và thiết bị drone.",
      title: "Drone STEM",
    });

    expect(result.status).toBe(ContentStatus.PUBLISHED);
    expect(articleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        bodyMarkdown: "# Drone STEM",
        revisionNumber: 3,
        status: ContentStatus.PUBLISHED,
      }),
    );
    expect(revisionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        articleId: "article-drone-stem",
        bodyMarkdown: "# Drone STEM",
        revisionNumber: 3,
      }),
    );
  });
});
