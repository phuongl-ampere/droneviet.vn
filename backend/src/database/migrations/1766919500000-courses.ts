import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CoursesMigration1766919500000 implements MigrationInterface {
  name = "CoursesMigration1766919500000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "courses",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "slug", type: "varchar", length: "255", isUnique: true },
          { name: "locale", type: "varchar", length: "16" },
          { name: "title", type: "varchar", length: "255" },
          { name: "summary", type: "text" },
          {
            name: "purchaseMode",
            type: "enum",
            enum: ["checkout", "quote_only"],
          },
          { name: "tuitionVnd", type: "bigint", unsigned: true, isNullable: true },
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
        name: "course_sessions",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "courseId", type: "varchar", length: "36" },
          { name: "startsAt", type: "timestamp" },
          { name: "capacity", type: "int", unsigned: true },
          { name: "reservedSeats", type: "int", unsigned: true, default: 0 },
          { name: "status", type: "enum", enum: ["open", "closed"] },
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
        name: "course_enrollments",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "sessionId", type: "varchar", length: "36" },
          { name: "contactName", type: "varchar", length: "255" },
          { name: "contactPhone", type: "varchar", length: "64" },
          { name: "contactEmail", type: "varchar", length: "255", isNullable: true },
          { name: "quantity", type: "int", unsigned: true },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      "course_sessions",
      new TableForeignKey({
        columnNames: ["courseId"],
        referencedColumnNames: ["id"],
        referencedTableName: "courses",
        onDelete: "CASCADE",
      }),
    );
    await queryRunner.createForeignKey(
      "course_enrollments",
      new TableForeignKey({
        columnNames: ["sessionId"],
        referencedColumnNames: ["id"],
        referencedTableName: "course_sessions",
        onDelete: "CASCADE",
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("course_enrollments");
    await queryRunner.dropTable("course_sessions");
    await queryRunner.dropTable("courses");
  }
}
