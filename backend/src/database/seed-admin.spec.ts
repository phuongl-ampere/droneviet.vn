import { describe, expect, it, vi } from "vitest";
import { UserRole } from "../auth/entities/user.entity";
import { seedAdmin } from "./seed-admin";

describe("seedAdmin", () => {
  it("uses the documented local admin defaults in development", async () => {
    const repository = {
      upsert: vi.fn(),
    };

    await seedAdmin(
      {
        getRepository: vi.fn(() => repository),
      } as never,
      { NODE_ENV: "development" },
    );

    expect(repository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin@droneviet.vn",
        roles: [UserRole.SUPER_ADMIN],
      }),
      ["email"],
    );
  });

  it("requires explicit seed credentials outside development", async () => {
    for (const NODE_ENV of ["production", "staging", undefined]) {
      await expect(
        seedAdmin(
          {
            getRepository: vi.fn(),
          } as never,
          { NODE_ENV },
        ),
      ).rejects.toThrow(
        "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be configured before seeding an admin",
      );
    }
  });

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
