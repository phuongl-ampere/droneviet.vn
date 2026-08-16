import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from "typeorm";

export class ContentMigration1766918800000 implements MigrationInterface {
  name = "ContentMigration1766918800000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "articles",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          {
            name: "slug",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          { name: "locale", type: "varchar", length: "16", default: "'vi'" },
          { name: "title", type: "varchar", length: "255" },
          { name: "summary", type: "text", isNullable: true },
          { name: "bodyMarkdown", type: "longtext" },
          { name: "renderedHtml", type: "longtext", isNullable: true },
          { name: "tableOfContents", type: "json", isNullable: true },
          {
            name: "coverImageUrl",
            type: "varchar",
            length: "1024",
            isNullable: true,
          },
          {
            name: "seoTitle",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          { name: "seoDescription", type: "text", isNullable: true },
          {
            name: "status",
            type: "enum",
            enum: ["draft", "published", "scheduled"],
            default: "'draft'",
          },
          { name: "revisionNumber", type: "int", default: 0 },
          { name: "publishedAt", type: "timestamp", isNullable: true },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "content_revisions",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "articleId", type: "varchar", length: "36" },
          { name: "revisionNumber", type: "int" },
          { name: "bodyMarkdown", type: "longtext" },
          { name: "renderedHtml", type: "longtext" },
          { name: "tableOfContents", type: "json" },
          { name: "metadata", type: "json" },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      "content_revisions",
      new TableForeignKey({
        columnNames: ["articleId"],
        referencedColumnNames: ["id"],
        referencedTableName: "articles",
        onDelete: "CASCADE",
      }),
    );
    await queryRunner.createUniqueConstraint(
      "content_revisions",
      new TableUnique({
        name: "UQ_content_revisions_article_revision",
        columnNames: ["articleId", "revisionNumber"],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("content_revisions");
    await queryRunner.dropTable("articles");
  }
}
