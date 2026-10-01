import { describe, expect, it, vi } from "vitest";
import { ArticleEditorMode } from "./entities/article.entity";
import { AdminContentController } from "./admin-content.controller";

describe("AdminContentController", () => {
  it("sends the authenticated actor to draft creation and autosave", async () => {
    const content = {
      createArticleDraft: vi.fn().mockResolvedValue({ id: "article-1" }),
      updateArticleDraft: vi.fn().mockResolvedValue({ id: "article-1" }),
    };
    const controller = new AdminContentController(content as never);
    const request = { user: { sub: "admin-1" } };
    const input = {
      editorMode: ArticleEditorMode.MARKDOWN,
      locale: "vi",
      section: "research",
      slug: "flight-protocol",
      title: "Flight protocol",
    };

    await controller.createArticle(input as never, request);
    await controller.updateArticleDraft(
      "article-1",
      { bodyMarkdown: "# Protocol" } as never,
      request,
    );

    expect(content.createArticleDraft).toHaveBeenCalledWith(input, "admin-1");
    expect(content.updateArticleDraft).toHaveBeenCalledWith(
      "article-1",
      { bodyMarkdown: "# Protocol" },
      "admin-1",
    );
  });
});
