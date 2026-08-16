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
    if (!(await this.columnExists(queryRunner, "orders", "paymentOrderCode"))) {
      await queryRunner.query(
        "ALTER TABLE `orders` ADD COLUMN `paymentOrderCode` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE AFTER `orderNumber`",
      );
    }
    if (
      !(await this.columnExists(queryRunner, "orders", "reservationExpiresAt"))
    ) {
      await queryRunner.query(
        "ALTER TABLE `orders` ADD COLUMN `reservationExpiresAt` TIMESTAMP NULL AFTER `shippingAddress`",
      );
    }
    await queryRunner.query(
      "ALTER TABLE `orders` MODIFY `totalVnd` BIGINT UNSIGNED NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `order_lines` MODIFY `unitPriceVnd` BIGINT UNSIGNED NOT NULL, MODIFY `subtotalVnd` BIGINT UNSIGNED NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `quote_requests` MODIFY `budgetVnd` BIGINT UNSIGNED NULL",
    );
    if (
      !(await this.columnExists(queryRunner, "content_revisions", "metadata"))
    ) {
      await queryRunner.query(
        "ALTER TABLE `content_revisions` ADD COLUMN `metadata` JSON NULL AFTER `tableOfContents`",
      );
    }
    await queryRunner.query(
      "UPDATE `content_revisions` SET `metadata` = JSON_OBJECT() WHERE `metadata` IS NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `content_revisions` MODIFY `metadata` JSON NOT NULL",
    );
    if (
      !(await this.indexExists(
        queryRunner,
        "content_revisions",
        "UQ_content_revisions_article_revision",
      ))
    ) {
      await queryRunner.query(
        "ALTER TABLE `content_revisions` ADD CONSTRAINT `UQ_content_revisions_article_revision` UNIQUE (`articleId`, `revisionNumber`)",
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (
      await this.indexExists(
        queryRunner,
        "content_revisions",
        "UQ_content_revisions_article_revision",
      )
    ) {
      await queryRunner.query(
        "ALTER TABLE `content_revisions` DROP INDEX `UQ_content_revisions_article_revision`",
      );
    }
    if (
      await this.columnExists(queryRunner, "content_revisions", "metadata")
    ) {
      await queryRunner.query(
        "ALTER TABLE `content_revisions` DROP COLUMN `metadata`",
      );
    }
    await queryRunner.query(
      "ALTER TABLE `quote_requests` MODIFY `budgetVnd` INT UNSIGNED NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `order_lines` MODIFY `unitPriceVnd` INT UNSIGNED NOT NULL, MODIFY `subtotalVnd` INT UNSIGNED NOT NULL",
    );
    if (await this.columnExists(queryRunner, "orders", "paymentOrderCode")) {
      await queryRunner.query(
        "ALTER TABLE `orders` DROP COLUMN `paymentOrderCode`",
      );
    }
    if (await this.columnExists(queryRunner, "orders", "reservationExpiresAt")) {
      await queryRunner.query(
        "ALTER TABLE `orders` DROP COLUMN `reservationExpiresAt`",
      );
    }
    await queryRunner.query(
      "ALTER TABLE `orders` MODIFY `totalVnd` INT UNSIGNED NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `product_variants` MODIFY `priceVnd` INT UNSIGNED NOT NULL, MODIFY `compareAtVnd` INT UNSIGNED NULL",
    );
    await queryRunner.query("DELETE FROM `products` WHERE `kind` = 'course'");
    await queryRunner.query(
      "ALTER TABLE `products` MODIFY `kind` ENUM('accessory', 'bundle', 'drone', 'education_kit') NOT NULL",
    );
  }

  private async columnExists(
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

  private async indexExists(
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
}
