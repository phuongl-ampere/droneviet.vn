import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class PaymentsMigration1766919200000 implements MigrationInterface {
  name = "PaymentsMigration1766919200000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "payment_attempts",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "orderId", type: "varchar", length: "36" },
          {
            name: "provider",
            type: "enum",
            enum: ["payos", "vnpay"],
          },
          { name: "providerOrderCode", type: "bigint", unsigned: true },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "paid", "failed"],
            default: "'pending'",
          },
          { name: "amountVnd", type: "bigint", unsigned: true },
          { name: "checkoutUrl", type: "text", isNullable: true },
          {
            name: "providerReference",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          { name: "paidAt", type: "timestamp", isNullable: true },
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
    await queryRunner.createForeignKey(
      "payment_attempts",
      new TableForeignKey({
        columnNames: ["orderId"],
        referencedColumnNames: ["id"],
        referencedTableName: "orders",
        onDelete: "CASCADE",
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("payment_attempts");
  }
}
