import { describe, expect, it, vi } from "vitest";
import { ContentService } from "./content.service";
import { MarkdownRendererService } from "./markdown-renderer.service";

describe("ContentService.publishProductContent", () => {
  it("stores sanitized Markdown output for a product locale", async () => {
    const repository = {
      create: vi.fn((content) => content),
      findOneBy: vi.fn().mockResolvedValue(null),
      save: vi.fn(async (content) => ({ ...content, id: "product-content-1" })),
    };
    const manager = {
      getRepository: vi.fn(() => repository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const renderer = {
      render: vi.fn().mockResolvedValue({
        html: "<h1 id=\"kit\">Kit</h1>",
        tableOfContents: [{ depth: 1, id: "kit", text: "Kit" }],
      }),
    } as unknown as MarkdownRendererService;
    const service = new ContentService(dataSource as never, renderer);

    await expect(
      service.publishProductContent("product-primary-lab", {
        bodyMarkdown: "# Kit",
        locale: "vi",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "product-content-1",
        productId: "product-primary-lab",
      }),
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        bodyMarkdown: "# Kit",
        locale: "vi",
        renderedHtml: "<h1 id=\"kit\">Kit</h1>",
      }),
    );
  });
});
