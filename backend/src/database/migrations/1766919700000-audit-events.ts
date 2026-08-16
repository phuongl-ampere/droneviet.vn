import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AuditEventsMigration1766919700000 implements MigrationInterface {
  name = "AuditEventsMigration1766919700000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "audit_events",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "actorId", type: "varchar", length: "36", isNullable: true },
          { name: "action", type: "varchar", length: "128" },
          { name: "aggregateType", type: "varchar", length: "64" },
          { name: "aggregateId", type: "varchar", length: "36" },
          { name: "previousState", type: "json", isNullable: true },
          { name: "nextState", type: "json" },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("audit_events");
  }
}
