import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class QuoteRequestsMigration1766919100000
  implements MigrationInterface
{
  name = "QuoteRequestsMigration1766919100000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "quote_requests",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "organization", type: "varchar", length: "255" },
          { name: "contactName", type: "varchar", length: "255" },
          { name: "phone", type: "varchar", length: "64" },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "budgetVnd",
            type: "bigint",
            unsigned: true,
            isNullable: true,
          },
          { name: "quantity", type: "int", unsigned: true },
          { name: "requirements", type: "text", isNullable: true },
          {
            name: "status",
            type: "enum",
            enum: ["new", "qualified", "sent", "converted", "lost"],
            default: "'new'",
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
    await queryRunner.dropTable("quote_requests");
  }
}
