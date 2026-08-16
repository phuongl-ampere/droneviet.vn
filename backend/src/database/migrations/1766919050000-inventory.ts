import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class InventoryMigration1766919050000 implements MigrationInterface {
  name = "InventoryMigration1766919050000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "inventory_items",
        columns: [
          { name: "id", type: "varchar", length: "36", isPrimary: true },
          {
            name: "productVariantId",
            type: "varchar",
            length: "36",
            isUnique: true,
          },
          { name: "onHand", type: "int", unsigned: true, default: 0 },
          { name: "reserved", type: "int", unsigned: true, default: 0 },
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
      "inventory_items",
      new TableForeignKey({
        columnNames: ["productVariantId"],
        referencedColumnNames: ["id"],
        referencedTableName: "product_variants",
        onDelete: "CASCADE",
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("inventory_items");
  }
}
