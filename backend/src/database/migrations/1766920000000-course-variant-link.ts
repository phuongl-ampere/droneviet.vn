import { MigrationInterface, QueryRunner } from "typeorm";

export class CourseVariantLinkMigration1766920000000
  implements MigrationInterface
{
  name = "CourseVariantLinkMigration1766920000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `courses` ADD COLUMN `productVariantId` VARCHAR(36) NULL UNIQUE AFTER `slug`",
    );
    await queryRunner.query(
      "UPDATE `courses` AS `course` INNER JOIN `products` AS `product` ON `product`.`slug` = CONCAT('course-', `course`.`slug`) INNER JOIN `product_variants` AS `variant` ON `variant`.`productId` = `product`.`id` SET `course`.`productVariantId` = `variant`.`id`",
    );
    await queryRunner.query(
      "ALTER TABLE `courses` MODIFY `productVariantId` VARCHAR(36) NOT NULL",
    );
  }

  async down(): Promise<void> {
    throw new Error(
      "CourseVariantLinkMigration1766920000000 is forward-only. Restore from backup to roll back after this migration.",
    );
  }
}
