import { MigrationInterface, QueryRunner } from "typeorm";

export class CommerceHardeningMigration1766919400000
  implements MigrationInterface
{
  name = "CommerceHardeningMigration1766919400000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `products` MODIFY `kind` ENUM('accessory', 'bundle', 'course', 'drone', 'education_kit') NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `product_variants` MODIFY `priceVnd` BIGINT UNSIGNED NOT NULL, MODIFY `compareAtVnd` BIGINT UNSIGNED NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `orders` ADD COLUMN `paymentOrderCode` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE AFTER `orderNumber`, ADD COLUMN `reservationExpiresAt` TIMESTAMP NULL AFTER `shippingAddress`, MODIFY `totalVnd` BIGINT UNSIGNED NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `order_lines` MODIFY `unitPriceVnd` BIGINT UNSIGNED NOT NULL, MODIFY `subtotalVnd` BIGINT UNSIGNED NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `quote_requests` MODIFY `budgetVnd` BIGINT UNSIGNED NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `content_revisions` ADD COLUMN `metadata` JSON NULL AFTER `tableOfContents`",
    );
    await queryRunner.query(
      "UPDATE `content_revisions` SET `metadata` = JSON_OBJECT() WHERE `metadata` IS NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `content_revisions` ADD CONSTRAINT `UQ_content_revisions_article_revision` UNIQUE (`articleId`, `revisionNumber`)",
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `content_revisions` DROP INDEX `UQ_content_revisions_article_revision`, DROP COLUMN `metadata`",
    );
    await queryRunner.query(
      "ALTER TABLE `quote_requests` MODIFY `budgetVnd` INT UNSIGNED NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `order_lines` MODIFY `unitPriceVnd` INT UNSIGNED NOT NULL, MODIFY `subtotalVnd` INT UNSIGNED NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `orders` DROP COLUMN `paymentOrderCode`, DROP COLUMN `reservationExpiresAt`, MODIFY `totalVnd` INT UNSIGNED NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `product_variants` MODIFY `priceVnd` INT UNSIGNED NOT NULL, MODIFY `compareAtVnd` INT UNSIGNED NULL",
    );
    await queryRunner.query("DELETE FROM `products` WHERE `kind` = 'course'");
    await queryRunner.query(
      "ALTER TABLE `products` MODIFY `kind` ENUM('accessory', 'bundle', 'drone', 'education_kit') NOT NULL",
    );
  }
}
