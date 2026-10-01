import { describe, expect, it, vi } from "vitest";
import { ResearchEngagementService } from "./research-engagement.service";

describe("ResearchEngagementService", () => {
  it("upserts one rating per customer and returns the recalculated aggregate", async () => {
    const articleRepository = {
      findOneByOrFail: vi.fn().mockResolvedValue({ id: "article-1" }),
    };
    const ratingRepository = {
      find: vi.fn().mockResolvedValue([{ score: 3 }, { score: 5 }]),
      upsert: vi.fn(),
    };
    const service = new ResearchEngagementService(
      {
        getRepository: vi.fn((entity) =>
          entity.name === "Article" ? articleRepository : ratingRepository,
        ),
      } as never,
      { record: vi.fn() } as never,
    );

    await service.rate("research-slug", "customer-1", 5);
    await service.rate("research-slug", "customer-1", 3);

    expect(ratingRepository.upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        articleId: "article-1",
        score: 3,
        userId: "customer-1",
      }),
      ["articleId", "userId"],
    );
  });

  it("creates a visible plain-text comment immediately and lets a moderator hide it", async () => {
    const articleRepository = {
      findOneByOrFail: vi.fn().mockResolvedValue({ id: "article-1" }),
    };
    const comment = {
      articleId: "article-1",
      authorId: "customer-1",
      body: "Useful protocol. I reproduced the timing.",
      id: "comment-1",
      visible: true,
    };
    const commentRepository = {
      create: vi.fn((input) => input),
      findOneByOrFail: vi.fn().mockResolvedValue(comment),
      save: vi.fn(async (input) => input),
    };
    const service = new ResearchEngagementService(
      {
        getRepository: vi.fn((entity) => {
          if (entity.name === "Article") return articleRepository;
          return commentRepository;
        }),
      } as never,
      { record: vi.fn() } as never,
    );

    const created = await service.createComment("research-slug", "customer-1", {
      body: "Useful protocol. I reproduced the timing.",
    });

    expect(created.visible).toBe(true);
    await service.hideComment(comment.id, "admin-1");
    expect(commentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ visible: false }),
    );
  });
});
