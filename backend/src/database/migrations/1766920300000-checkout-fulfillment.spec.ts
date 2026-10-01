import { describe, expect, it, vi } from "vitest";
import { CheckoutFulfillmentMigration1766920300000 } from "./1766920300000-checkout-fulfillment";

describe("CheckoutFulfillmentMigration1766920300000", () => {
  it("adds checkout fulfillment snapshots without rewriting existing orders", async () => {
    const query = vi.fn().mockResolvedValue([]);
    const migration = new CheckoutFulfillmentMigration1766920300000();

    await migration.up({ query } as never);

    expect(query).toHaveBeenCalledWith(
      "SHOW COLUMNS FROM `orders` LIKE ?",
      ["fulfillmentMethod"],
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining(
        "ADD COLUMN `fulfillmentMethod` ENUM('delivery', 'showroom_pickup') NOT NULL DEFAULT 'delivery'",
      ),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("ADD COLUMN `shippingNote` TEXT NULL"),
    );
  });

  it("refuses destructive rollback", async () => {
    const migration = new CheckoutFulfillmentMigration1766920300000();

    await expect(migration.down()).rejects.toThrow("forward-only");
  });
});
