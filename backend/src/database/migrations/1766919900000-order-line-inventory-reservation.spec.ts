import { describe, expect, it, vi } from "vitest";
import { OrderLineInventoryReservationMigration1766919900000 } from "./1766919900000-order-line-inventory-reservation";

describe("OrderLineInventoryReservationMigration1766919900000", () => {
  it("backfills inventory-reserved lines for physical non-preorder variants", async () => {
    const query = vi.fn().mockResolvedValue([]);
    const migration =
      new OrderLineInventoryReservationMigration1766919900000();

    await migration.up({ query } as never);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE `order_lines` AS `line`"),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("`variant`.`purchaseMode` <> 'preorder'"),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("`product`.`kind` <> 'course'"),
    );
  });

  it("stops when existing reservations cannot be safely inferred", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { expectedReserved: 0, productVariantId: "variant-1", reserved: 1 },
      ]);
    const migration =
      new OrderLineInventoryReservationMigration1766919900000();

    await expect(migration.up({ query } as never)).rejects.toThrow(
      "cannot safely infer existing inventory reservations",
    );
  });

  it("refuses destructive rollback", async () => {
    const migration =
      new OrderLineInventoryReservationMigration1766919900000();

    await expect(migration.down()).rejects.toThrow("forward-only");
  });
});
