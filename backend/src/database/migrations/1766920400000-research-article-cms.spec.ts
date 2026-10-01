import { describe, expect, it, vi } from "vitest";
import { ResearchArticleCmsMigration1766920400000 } from "./1766920400000-research-article-cms";

describe("ResearchArticleCmsMigration1766920400000", () => {
  it("backfills existing articles as Markdown news without changing publication state", async () => {
    const query = vi.fn().mockResolvedValue([]);
    const migration = new ResearchArticleCmsMigration1766920400000();

    await migration.up({ query } as never);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("ADD COLUMN `editorMode`"),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE `articles` SET `section` = 'news'"),
    );
  });

  it("creates unique per-user article rating and comment report constraints", async () => {
    const query = vi.fn().mockResolvedValue([]);
    const migration = new ResearchArticleCmsMigration1766920400000();

    await migration.up({ query } as never);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("UNIQUE KEY `UQ_article_ratings_article_user`"),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining(
        "UQ_article_comment_reports_comment_reporter",
      ),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("`publicUrl` VARCHAR(255) NOT NULL"),
    );
  });

  it("refuses destructive rollback", async () => {
    const migration = new ResearchArticleCmsMigration1766920400000();

    await expect(migration.down()).rejects.toThrow("forward-only");
  });
});
