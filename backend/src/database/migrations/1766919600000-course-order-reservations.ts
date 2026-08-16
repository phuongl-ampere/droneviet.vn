import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class CourseOrderReservationsMigration1766919600000
  implements MigrationInterface
{
  name = "CourseOrderReservationsMigration1766919600000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `order_lines` ADD COLUMN `courseSessionId` VARCHAR(36) NULL AFTER `productVariantId`",
    );
    await queryRunner.query(
      "ALTER TABLE `course_enrollments` ADD COLUMN `orderId` VARCHAR(36) NULL AFTER `sessionId`, ADD COLUMN `status` ENUM('reserved', 'confirmed', 'cancelled') NOT NULL DEFAULT 'reserved' AFTER `quantity`",
    );
    await queryRunner.createForeignKey(
      "order_lines",
      new TableForeignKey({
        columnNames: ["courseSessionId"],
        referencedColumnNames: ["id"],
        referencedTableName: "course_sessions",
        onDelete: "SET NULL",
      }),
    );
    await queryRunner.createForeignKey(
      "course_enrollments",
      new TableForeignKey({
        columnNames: ["orderId"],
        referencedColumnNames: ["id"],
        referencedTableName: "orders",
        onDelete: "SET NULL",
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `course_enrollments` DROP COLUMN `orderId`, DROP COLUMN `status`",
    );
    await queryRunner.query(
      "ALTER TABLE `order_lines` DROP COLUMN `courseSessionId`",
    );
  }
}
