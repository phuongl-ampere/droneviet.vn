import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentRefundReferenceMigration1766920100000
  implements MigrationInterface
{
  name = "PaymentRefundReferenceMigration1766920100000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `payment_attempts` ADD COLUMN `refundReference` VARCHAR(255) NULL AFTER `paidAt`, ADD COLUMN `refundedAt` TIMESTAMP NULL AFTER `refundReference`",
    );
  }

  async down(): Promise<void> {
    throw new Error(
      "PaymentRefundReferenceMigration1766920100000 is forward-only. Restore from backup to roll back after this migration.",
    );
  }
}
