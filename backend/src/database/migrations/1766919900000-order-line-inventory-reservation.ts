import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderLineInventoryReservationMigration1766919900000
  implements MigrationInterface
{
  name = "OrderLineInventoryReservationMigration1766919900000";

  async up(queryRunner: QueryRunner): Promise<void> {
    const columns = (await queryRunner.query(
      "SHOW COLUMNS FROM `order_lines` LIKE ?",
      ["reservesInventory"],
    )) as unknown[];

    if (columns.length === 0) {
      await queryRunner.query(
        "ALTER TABLE `order_lines` ADD COLUMN `reservesInventory` TINYINT NOT NULL DEFAULT 0 AFTER `quantity`",
      );
    }

    const ambiguousReservations = (await queryRunner.query(
      "SELECT `inventory`.`productVariantId`, `inventory`.`reserved`, COALESCE(SUM(CASE WHEN `order`.`status` = 'pending_payment' AND `variant`.`purchaseMode` <> 'preorder' AND `product`.`kind` <> 'course' THEN `line`.`quantity` ELSE 0 END), 0) AS `expectedReserved` FROM `inventory_items` AS `inventory` LEFT JOIN `order_lines` AS `line` ON `line`.`productVariantId` = `inventory`.`productVariantId` LEFT JOIN `orders` AS `order` ON `order`.`id` = `line`.`orderId` LEFT JOIN `product_variants` AS `variant` ON `variant`.`id` = `line`.`productVariantId` LEFT JOIN `products` AS `product` ON `product`.`id` = `variant`.`productId` GROUP BY `inventory`.`productVariantId`, `inventory`.`reserved` HAVING `inventory`.`reserved` <> `expectedReserved`",
    )) as unknown[];

    if (ambiguousReservations.length > 0) {
      throw new Error(
        "cannot safely infer existing inventory reservations. Reconcile inventory_items.reserved before running this migration.",
      );
    }

    await queryRunner.query(
      "UPDATE `order_lines` AS `line` INNER JOIN `orders` AS `order` ON `order`.`id` = `line`.`orderId` INNER JOIN `product_variants` AS `variant` ON `variant`.`id` = `line`.`productVariantId` INNER JOIN `products` AS `product` ON `product`.`id` = `variant`.`productId` INNER JOIN `inventory_items` AS `inventory` ON `inventory`.`productVariantId` = `line`.`productVariantId` SET `line`.`reservesInventory` = 1 WHERE `line`.`reservesInventory` = 0 AND `order`.`status` = 'pending_payment' AND `variant`.`purchaseMode` <> 'preorder' AND `product`.`kind` <> 'course'",
    );
  }

  async down(): Promise<void> {
    throw new Error(
      "OrderLineInventoryReservationMigration1766919900000 is forward-only. Restore from backup to roll back after this migration.",
    );
  }
}
