import { describe, expect, it, vi } from "vitest";
import { ArticleMediaService } from "./article-media.service";

describe("ArticleMediaService", () => {
  it("lists the shared media library with newest uploads first", async () => {
    const repository = {
      find: vi.fn().mockResolvedValue([
        {
          altText: "newest-drone.png",
          createdAt: new Date("2026-08-23T08:00:00.000Z"),
          height: 640,
          id: "media-new",
          publicUrl: "/media/articles/2026/08/newest-drone.webp",
          width: 640,
        },
      ]),
    };
    const service = new ArticleMediaService(
      { getRepository: vi.fn(() => repository) } as never,
      {} as never,
    );

    await expect(service.list()).resolves.toEqual([
      {
        alt: "newest-drone.png",
        createdAt: "2026-08-23T08:00:00.000Z",
        height: 640,
        id: "media-new",
        url: "/media/articles/2026/08/newest-drone.webp",
        width: 640,
      },
    ]);
    expect(repository.find).toHaveBeenCalledWith({
      order: { createdAt: "DESC" },
    });
  });
});
