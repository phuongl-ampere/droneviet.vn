import { describe, expect, it } from "vitest";
import { CommerceHardeningMigration1766919400000 } from "./1766919400000-commerce-hardening";

describe("CommerceHardeningMigration1766919400000", () => {
  it("refuses rollback instead of deleting schema created by intermediate versions", async () => {
    const migration = new CommerceHardeningMigration1766919400000();

    await expect(migration.down({} as never)).rejects.toThrow("forward-only");
  });
});
