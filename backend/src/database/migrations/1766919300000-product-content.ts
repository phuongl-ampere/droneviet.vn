import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class ProductContentMigration1766919300000
  implements MigrationInterface
{
  name = "ProductContentMigration1766919300000";

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("product_content"))) {
      await queryRunner.createTable(
        new Table({
          name: "product_content",
          columns: [
            { name: "id", type: "varchar", length: "36", isPrimary: true },
            { name: "productId", type: "varchar", length: "36" },
            { name: "locale", type: "varchar", length: "16" },
            { name: "bodyMarkdown", type: "longtext" },
            { name: "renderedHtml", type: "longtext" },
            { name: "tableOfContents", type: "json" },
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
    }

    const table = await queryRunner.getTable("product_content");
    if (!table?.foreignKeys.some((key) => key.columnNames.includes("productId"))) {
      await queryRunner.createForeignKey(
        "product_content",
        new TableForeignKey({
          columnNames: ["productId"],
          referencedColumnNames: ["id"],
          referencedTableName: "products",
          onDelete: "CASCADE",
        }),
      );
    }
    if (!table?.indices.some((index) => index.name === "UQ_product_content_locale")) {
      await queryRunner.createIndex(
        "product_content",
        new TableIndex({
          name: "UQ_product_content_locale",
          columnNames: ["productId", "locale"],
          isUnique: true,
        }),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("product_content");
  }
}
