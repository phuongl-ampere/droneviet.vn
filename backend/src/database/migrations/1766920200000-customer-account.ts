import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomerAccountMigration1766920200000
  implements MigrationInterface
{
  name = "CustomerAccountMigration1766920200000";

  async up(queryRunner: QueryRunner): Promise<void> {
    const phoneColumn = (await queryRunner.query(
      "SHOW COLUMNS FROM `users` LIKE ?",
      ["phone"],
    )) as unknown[];

    if (phoneColumn.length === 0) {
      await queryRunner.query(
        "ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(64) NULL AFTER `displayName`",
      );
    }

    const customerColumn = (await queryRunner.query(
      "SHOW COLUMNS FROM `orders` LIKE ?",
      ["customerId"],
    )) as unknown[];

    if (customerColumn.length === 0) {
      await queryRunner.query(
        "ALTER TABLE `orders` ADD COLUMN `customerId` VARCHAR(36) NULL AFTER `contactEmail`",
      );
      await queryRunner.query(
        "CREATE INDEX `IDX_orders_customer_id` ON `orders` (`customerId`)",
      );
      await queryRunner.query(
        "ALTER TABLE `orders` ADD CONSTRAINT `FK_orders_customer_id` FOREIGN KEY (`customerId`) REFERENCES `users` (`id`) ON DELETE SET NULL",
      );
    }

    await queryRunner.query(
      "UPDATE `orders` AS `order` INNER JOIN `users` AS `user` ON LOWER(TRIM(`order`.`contactEmail`)) = LOWER(TRIM(`user`.`email`)) SET `order`.`customerId` = `user`.`id` WHERE `order`.`customerId` IS NULL AND `order`.`contactEmail` IS NOT NULL",
    );
  }

  async down(): Promise<void> {
    throw new Error(
      "CustomerAccountMigration1766920200000 is forward-only. Restore from backup to roll back after this migration.",
    );
  }
}
