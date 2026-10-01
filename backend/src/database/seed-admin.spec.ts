import { describe, expect, it, vi } from "vitest";
import { UserRole } from "../auth/entities/user.entity";
import { seedAdmin } from "./seed-admin";

describe("seedAdmin", () => {
  it("upserts the configured super admin without logging credentials", async () => {
    const repository = {
      upsert: vi.fn(),
    };

    await seedAdmin(
      {
        getRepository: vi.fn(() => repository),
      } as never,
      {
        SEED_ADMIN_EMAIL: "admin@droneviet.vn",
        SEED_ADMIN_PASSWORD: "AdminPassword!23",
      },
    );

    expect(repository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin@droneviet.vn",
        roles: [UserRole.SUPER_ADMIN],
      }),
      ["email"],
    );
  });
});
