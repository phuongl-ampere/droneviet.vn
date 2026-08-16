import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class OrdersMigration1766919000000 implements MigrationInterface {
  name = "OrdersMigration1766919000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          {
            name: "orderNumber",
            type: "varchar",
            length: "32",
            isUnique: true,
          },
          {
            name: "paymentOrderCode",
            type: "bigint",
            unsigned: true,
            isGenerated: true,
            generationStrategy: "increment",
            isUnique: true,
          },
          {
            name: "status",
            type: "enum",
            enum: [
              "pending_payment",
              "paid",
              "packing",
              "shipped",
              "delivered",
              "cancelled",
              "payment_failed",
              "refund_requested",
              "refunded",
            ],
          },
          {
            name: "paymentMethod",
            type: "enum",
            enum: ["payos", "cod", "bank_transfer"],
          },
          { name: "totalVnd", type: "bigint", unsigned: true },
          { name: "contactName", type: "varchar", length: "255" },
          { name: "contactPhone", type: "varchar", length: "64" },
          {
            name: "contactEmail",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          { name: "shippingAddress", type: "text", isNullable: true },
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
        name: "order_lines",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          { name: "orderId", type: "varchar", length: "36" },
          { name: "productVariantId", type: "varchar", length: "36" },
          { name: "sku", type: "varchar", length: "255" },
          { name: "title", type: "varchar", length: "512" },
          { name: "unitPriceVnd", type: "bigint", unsigned: true },
          { name: "quantity", type: "int", unsigned: true },
          { name: "subtotalVnd", type: "bigint", unsigned: true },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      "order_lines",
      new TableForeignKey({
        columnNames: ["orderId"],
        referencedColumnNames: ["id"],
        referencedTableName: "orders",
        onDelete: "CASCADE",
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("order_lines");
    await queryRunner.dropTable("orders");
  }
}
