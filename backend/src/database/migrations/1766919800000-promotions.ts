import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class PromotionsMigration1766919800000 implements MigrationInterface {
  name = "PromotionsMigration1766919800000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "promo_codes",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "code", type: "varchar", length: "64", isUnique: true },
          { name: "type", type: "enum", enum: ["fixed", "percentage"] },
          { name: "value", type: "int", unsigned: true },
          { name: "minimumOrderVnd", type: "bigint", unsigned: true, isNullable: true },
          { name: "maxDiscountVnd", type: "bigint", unsigned: true, isNullable: true },
          { name: "usageLimit", type: "int", unsigned: true, isNullable: true },
          { name: "usageCount", type: "int", unsigned: true, default: 0 },
          { name: "isActive", type: "boolean", default: true },
          { name: "startsAt", type: "timestamp", isNullable: true },
          { name: "endsAt", type: "timestamp", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );
    await queryRunner.query(
      "ALTER TABLE `orders` ADD COLUMN `subtotalVnd` BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER `totalVnd`, ADD COLUMN `discountVnd` BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER `subtotalVnd`, ADD COLUMN `promotionCode` VARCHAR(64) NULL AFTER `discountVnd`",
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `orders` DROP COLUMN `subtotalVnd`, DROP COLUMN `discountVnd`, DROP COLUMN `promotionCode`",
    );
    await queryRunner.dropTable("promo_codes");
  }
}
