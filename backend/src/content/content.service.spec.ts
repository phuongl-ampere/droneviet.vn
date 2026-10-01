import { describe, expect, it, vi } from "vitest";
import {
  ArticleEditorMode,
  ArticleSection,
  ContentStatus,
} from "./entities/article.entity";
import { ContentService } from "./content.service";
import { MarkdownRendererService } from "./markdown-renderer.service";
import { RichTextRendererService } from "./rich-text-renderer.service";

describe("ContentService", () => {
  it("creates an article as a non-public draft", async () => {
    const articleRepository = {
      create: vi.fn((article) => article),
      save: vi.fn(async (article) => ({ ...article, id: "article-stem" })),
    };
    const manager = {
      getRepository: vi.fn(() => articleRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const service = new ContentService(
      dataSource as never,
      {} as MarkdownRendererService,
      {} as RichTextRendererService,
      { record: vi.fn() } as never,
    );

    await expect(
      service.createArticle({
        bodyMarkdown: "# Drone STEM",
        locale: "vi",
        slug: "drone-stem",
        title: "Drone STEM",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "article-stem",
        slug: "drone-stem",
        status: ContentStatus.DRAFT,
      }),
    );
  });

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
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "Article" ? articleRepository : revisionRepository,
      ),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const markdownRenderer = {
      render: vi.fn().mockResolvedValue({
        html: "<h1 id=\"drone-stem\">Drone STEM</h1>",
        tableOfContents: [{ depth: 1, id: "drone-stem", text: "Drone STEM" }],
      }),
    } as unknown as MarkdownRendererService;
    const service = new ContentService(
      dataSource as never,
      markdownRenderer,
      {} as RichTextRendererService,
      { record: vi.fn() } as never,
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
        metadata: expect.objectContaining({
          seoDescription: "Học drone STEM",
          summary: "Giáo trình và thiết bị drone.",
          title: "Drone STEM",
        }),
        revisionNumber: 3,
      }),
    );
    expect(dataSource.transaction).toHaveBeenCalledOnce();
  });

  it("rejects changing editor mode after a Markdown draft contains content", async () => {
    const articleRepository = {
      findOneByOrFail: vi.fn().mockResolvedValue({
        bodyJson: null,
        bodyMarkdown: "# Existing protocol",
        editorMode: ArticleEditorMode.MARKDOWN,
        id: "article-1",
      }),
    };
    const service = new ContentService(
      { getRepository: vi.fn(() => articleRepository) } as never,
      {} as MarkdownRendererService,
      {} as RichTextRendererService,
      { record: vi.fn() } as never,
    );

    await expect(
      service.updateArticleDraft(
        "article-1",
        {
          bodyJson: {
            root: {
              children: [{ children: [], type: "paragraph", version: 1 }],
              type: "root",
              version: 1,
            },
          },
          editorMode: ArticleEditorMode.RICH_TEXT,
        },
        "admin-1",
      ),
    ).rejects.toThrow("editor mode is locked");
  });

  it("publishes exactly one immutable revision from the active rich-text source", async () => {
    const articleRepository = {
      findOneByOrFail: vi.fn().mockResolvedValue({
        bodyJson: {
          root: {
            children: [
              {
                children: [{ text: "Existing body", type: "text", version: 1 }],
                type: "paragraph",
                version: 1,
              },
            ],
            type: "root",
            version: 1,
          },
        },
        bodyMarkdown: "",
        coverImageAlt: null,
        coverImageUrl: null,
        editorMode: ArticleEditorMode.RICH_TEXT,
        id: "article-rich-1",
        locale: "vi",
        readingTimeMinutes: 1,
        revisionNumber: 0,
        section: ArticleSection.RESEARCH,
        slug: "flight-protocol",
        tags: [],
      }),
      save: vi.fn(async (article) => article),
    };
    const revisionRepository = {
      create: vi.fn((revision) => revision),
      save: vi.fn(async (revision) => revision),
    };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "Article" ? articleRepository : revisionRepository,
      ),
    };
    const richTextRenderer = {
      render: vi.fn().mockResolvedValue({
        html: "<h2 id=\"method\">Method</h2><p>Protocol</p>",
        tableOfContents: [{ depth: 2, id: "method", text: "Method" }],
        text: "Method Protocol",
      }),
    } as unknown as RichTextRendererService;
    const service = new ContentService(
      { transaction: vi.fn((callback) => callback(manager)) } as never,
      {} as MarkdownRendererService,
      richTextRenderer,
      { record: vi.fn() } as never,
    );
    const bodyJson = {
      root: {
        children: [
          {
            children: [{ text: "Method", type: "text", version: 1 }],
            tag: "h2",
            type: "heading",
            version: 1,
          },
        ],
        type: "root",
        version: 1,
      },
    };

    const published = await service.publishArticle(
      "article-rich-1",
      {
        bodyJson,
        editorMode: ArticleEditorMode.RICH_TEXT,
        title: "Flight protocol",
      },
      "admin-1",
    );

    expect(published.renderedHtml).toContain("<h2");
    expect(revisionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        bodyJson,
        editorMode: ArticleEditorMode.RICH_TEXT,
      }),
    );
  });
});
