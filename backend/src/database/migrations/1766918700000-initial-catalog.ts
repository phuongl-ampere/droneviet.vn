import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class InitialCatalogMigration1766918700000
  implements MigrationInterface
{
  name = "InitialCatalogMigration1766918700000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          {
            name: "slug",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          { name: "name", type: "varchar", length: "255" },
          { name: "summary", type: "text" },
          {
            name: "kind",
            type: "enum",
            enum: ["accessory", "bundle", "course", "drone", "education_kit"],
          },
          {
            name: "status",
            type: "enum",
            enum: ["archived", "draft", "published"],
            default: "'draft'",
          },
          {
            name: "coverImageUrl",
            type: "varchar",
            length: "1024",
            isNullable: true,
          },
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
        name: "product_variants",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "productId", type: "varchar", length: "36" },
          {
            name: "sku",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          { name: "title", type: "varchar", length: "255" },
          { name: "priceVnd", type: "bigint", unsigned: true },
          {
            name: "compareAtVnd",
            type: "bigint",
            unsigned: true,
            isNullable: true,
          },
          {
            name: "purchaseMode",
            type: "enum",
            enum: ["checkout", "preorder", "quote_only"],
          },
          { name: "isActive", type: "boolean", default: true },
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

    await queryRunner.createForeignKey(
      "product_variants",
      new TableForeignKey({
        columnNames: ["productId"],
        referencedColumnNames: ["id"],
        referencedTableName: "products",
        onDelete: "CASCADE",
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("product_variants");
    await queryRunner.dropTable("products");
  }
}
