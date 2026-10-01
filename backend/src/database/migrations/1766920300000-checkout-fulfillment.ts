import { MigrationInterface, QueryRunner } from "typeorm";

export class CheckoutFulfillmentMigration1766920300000
  implements MigrationInterface
{
  name = "CheckoutFulfillmentMigration1766920300000";

  async up(queryRunner: QueryRunner): Promise<void> {
    const fulfillmentColumn = (await queryRunner.query(
      "SHOW COLUMNS FROM `orders` LIKE ?",
      ["fulfillmentMethod"],
    )) as unknown[];

    if (fulfillmentColumn.length === 0) {
      await queryRunner.query(
        "ALTER TABLE `orders` ADD COLUMN `fulfillmentMethod` ENUM('delivery', 'showroom_pickup') NOT NULL DEFAULT 'delivery' AFTER `shippingAddress`",
      );
    }

    const shippingNoteColumn = (await queryRunner.query(
      "SHOW COLUMNS FROM `orders` LIKE ?",
      ["shippingNote"],
    )) as unknown[];

    if (shippingNoteColumn.length === 0) {
      await queryRunner.query(
        "ALTER TABLE `orders` ADD COLUMN `shippingNote` TEXT NULL AFTER `fulfillmentMethod`",
      );
    }
  }

  async down(): Promise<void> {
    throw new Error(
      "CheckoutFulfillmentMigration1766920300000 is forward-only. Restore from backup to roll back after this migration.",
    );
  }
}
