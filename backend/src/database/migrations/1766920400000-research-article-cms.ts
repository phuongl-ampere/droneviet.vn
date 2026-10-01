import { MigrationInterface, QueryRunner } from "typeorm";

async function hasColumn(
  queryRunner: QueryRunner,
  table: string,
  column: string,
): Promise<boolean> {
  const result = (await queryRunner.query(
    `SHOW COLUMNS FROM \`${table}\` LIKE ?`,
    [column],
  )) as unknown[];

  return result.length > 0;
}

async function hasIndex(
  queryRunner: QueryRunner,
  table: string,
  index: string,
): Promise<boolean> {
  const result = (await queryRunner.query(
    `SHOW INDEX FROM \`${table}\` WHERE Key_name = ?`,
    [index],
  )) as unknown[];

  return result.length > 0;
}

export class ResearchArticleCmsMigration1766920400000
  implements MigrationInterface
{
  name = "ResearchArticleCmsMigration1766920400000";

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await hasColumn(queryRunner, "articles", "section"))) {
      await queryRunner.query(
        "ALTER TABLE `articles` ADD COLUMN `section` ENUM('news', 'research') NOT NULL DEFAULT 'news' AFTER `locale`",
      );
    }
    if (!(await hasColumn(queryRunner, "articles", "editorMode"))) {
      await queryRunner.query(
        "ALTER TABLE `articles` ADD COLUMN `editorMode` ENUM('markdown', 'rich_text') NOT NULL DEFAULT 'markdown' AFTER `bodyMarkdown`",
      );
    }
    if (!(await hasColumn(queryRunner, "articles", "bodyJson"))) {
      await queryRunner.query(
        "ALTER TABLE `articles` ADD COLUMN `bodyJson` JSON NULL AFTER `editorMode`",
      );
    }
    if (!(await hasColumn(queryRunner, "articles", "coverImageAlt"))) {
      await queryRunner.query(
        "ALTER TABLE `articles` ADD COLUMN `coverImageAlt` VARCHAR(255) NULL AFTER `coverImageUrl`",
      );
    }
    if (!(await hasColumn(queryRunner, "articles", "tags"))) {
      await queryRunner.query(
        "ALTER TABLE `articles` ADD COLUMN `tags` JSON NULL AFTER `coverImageAlt`",
      );
    }
    if (!(await hasColumn(queryRunner, "articles", "authorId"))) {
      await queryRunner.query(
        "ALTER TABLE `articles` ADD COLUMN `authorId` VARCHAR(36) NULL AFTER `coverImageAlt`",
      );
      await queryRunner.query(
        "ALTER TABLE `articles` ADD CONSTRAINT `FK_articles_author_id` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE SET NULL",
      );
    }
    if (!(await hasColumn(queryRunner, "articles", "readingTimeMinutes"))) {
      await queryRunner.query(
        "ALTER TABLE `articles` ADD COLUMN `readingTimeMinutes` INT UNSIGNED NOT NULL DEFAULT 1 AFTER `authorId`",
      );
    }

    await queryRunner.query(
      "UPDATE `articles` SET `section` = 'news', `editorMode` = 'markdown' WHERE `section` IS NULL OR `editorMode` IS NULL",
    );
    if (!(await hasIndex(queryRunner, "articles", "IDX_articles_research_public"))) {
      await queryRunner.query(
        "CREATE INDEX `IDX_articles_research_public` ON `articles` (`section`, `status`, `locale`, `publishedAt`)",
      );
    }

    if (!(await hasColumn(queryRunner, "content_revisions", "editorMode"))) {
      await queryRunner.query(
        "ALTER TABLE `content_revisions` ADD COLUMN `editorMode` ENUM('markdown', 'rich_text') NOT NULL DEFAULT 'markdown' AFTER `bodyMarkdown`",
      );
    }
    if (!(await hasColumn(queryRunner, "content_revisions", "bodyJson"))) {
      await queryRunner.query(
        "ALTER TABLE `content_revisions` ADD COLUMN `bodyJson` JSON NULL AFTER `editorMode`",
      );
    }
    if (!(await hasColumn(queryRunner, "content_revisions", "metadata"))) {
      await queryRunner.query(
        "ALTER TABLE `content_revisions` ADD COLUMN `metadata` JSON NULL AFTER `tableOfContents`",
      );
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`article_media\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`articleId\` VARCHAR(36) NULL,
        \`uploaderId\` VARCHAR(36) NOT NULL,
        \`storageKey\` VARCHAR(255) NOT NULL,
        \`publicUrl\` VARCHAR(255) NOT NULL,
        \`altText\` VARCHAR(255) NOT NULL,
        \`originalMime\` VARCHAR(128) NOT NULL,
        \`width\` INT UNSIGNED NOT NULL,
        \`height\` INT UNSIGNED NOT NULL,
        \`bytes\` INT UNSIGNED NOT NULL,
        \`variants\` JSON NULL,
        \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_article_media_storage_key\` (\`storageKey\`),
        UNIQUE KEY \`UQ_article_media_public_url\` (\`publicUrl\`),
        KEY \`IDX_article_media_article\` (\`articleId\`),
        CONSTRAINT \`FK_article_media_article\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_article_media_uploader\` FOREIGN KEY (\`uploaderId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`article_comments\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`articleId\` VARCHAR(36) NOT NULL,
        \`authorId\` VARCHAR(36) NOT NULL,
        \`body\` VARCHAR(2000) NOT NULL,
        \`visible\` TINYINT(1) NOT NULL DEFAULT 1,
        \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_article_comments_public\` (\`articleId\`, \`visible\`, \`createdAt\`),
        CONSTRAINT \`FK_article_comments_article\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_article_comments_author\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`article_comment_reports\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`commentId\` VARCHAR(36) NOT NULL,
        \`reporterId\` VARCHAR(36) NOT NULL,
        \`reason\` VARCHAR(500) NOT NULL,
        \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_article_comment_reports_comment_reporter\` (\`commentId\`, \`reporterId\`),
        CONSTRAINT \`FK_article_comment_reports_comment\` FOREIGN KEY (\`commentId\`) REFERENCES \`article_comments\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_article_comment_reports_reporter\` FOREIGN KEY (\`reporterId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`article_ratings\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`articleId\` VARCHAR(36) NOT NULL,
        \`userId\` VARCHAR(36) NOT NULL,
        \`score\` TINYINT UNSIGNED NOT NULL,
        \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_article_ratings_article_user\` (\`articleId\`, \`userId\`),
        CONSTRAINT \`CHK_article_ratings_score\` CHECK (\`score\` >= 1 AND \`score\` <= 5),
        CONSTRAINT \`FK_article_ratings_article\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_article_ratings_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      )
    `);
  }

  async down(): Promise<void> {
    throw new Error(
      "ResearchArticleCmsMigration1766920400000 is forward-only. Restore from backup to roll back after this migration.",
    );
  }
}
