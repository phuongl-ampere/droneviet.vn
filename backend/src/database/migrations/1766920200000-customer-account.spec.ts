import { describe, expect, it, vi } from "vitest";
import { CustomerAccountMigration1766920200000 } from "./1766920200000-customer-account";

describe("CustomerAccountMigration1766920200000", () => {
  it("adds profile and order ownership columns before linking matching order emails", async () => {
    const query = vi.fn().mockResolvedValue([]);
    const migration = new CustomerAccountMigration1766920200000();

    await migration.up({ query } as never);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("ADD COLUMN `phone` VARCHAR(64) NULL"),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("ADD COLUMN `customerId` VARCHAR(36) NULL"),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("CREATE INDEX `IDX_orders_customer_id`"),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("FOREIGN KEY (`customerId`) REFERENCES `users` (`id`)"),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("LOWER(TRIM(`order`.`contactEmail`)) = LOWER(TRIM(`user`.`email`))"),
    );
  });

  it("refuses destructive rollback", async () => {
    const migration = new CustomerAccountMigration1766920200000();

    await expect(migration.down()).rejects.toThrow("forward-only");
  });
});
