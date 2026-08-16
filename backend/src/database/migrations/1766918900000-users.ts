import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class UsersMigration1766918900000 implements MigrationInterface {
  name = "UsersMigration1766918900000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          { name: "passwordHash", type: "varchar", length: "255" },
          { name: "roles", type: "json" },
          {
            name: "displayName",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
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
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
