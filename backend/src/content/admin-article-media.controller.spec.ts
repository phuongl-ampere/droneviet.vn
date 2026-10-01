import { describe, expect, it, vi } from "vitest";
import { AdminArticleMediaController } from "./admin-article-media.controller";

describe("AdminArticleMediaController", () => {
  it("exposes the shared media library to an authorized admin", async () => {
    const media = {
      list: vi.fn().mockResolvedValue([{ id: "media-1" }]),
    };
    const controller = new AdminArticleMediaController(media as never);

    await expect(controller.list()).resolves.toEqual([{ id: "media-1" }]);
    expect(media.list).toHaveBeenCalledOnce();
  });
});
