import { describe, expect, it, vi } from "vitest";
import * as bcrypt from "bcrypt";
import { UserRole } from "../auth/entities/user.entity";
import { seedAdmin } from "./seed-admin";

describe("seedAdmin", () => {
  it("creates the configured super admin when the account does not exist", async () => {
    const repository = {
      create: vi.fn((user) => user),
      findOneBy: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
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

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin@droneviet.vn",
        roles: [UserRole.SUPER_ADMIN],
      }),
    );
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it("does not change an existing admin password without an explicit force flag", async () => {
    const existing = {
      email: "admin@droneviet.vn",
      id: "admin-1",
      passwordHash: await bcrypt.hash("ExistingPassword!23", 12),
      roles: [UserRole.SUPER_ADMIN],
    };
    const repository = {
      create: vi.fn(),
      findOneBy: vi.fn().mockResolvedValue(existing),
      save: vi.fn(),
    };

    await seedAdmin(
      {
        getRepository: vi.fn(() => repository),
      } as never,
      {
        SEED_ADMIN_EMAIL: "admin@droneviet.vn",
        SEED_ADMIN_PASSWORD: "adminadmin12",
      },
    );

    expect(repository.save).not.toHaveBeenCalled();
    await expect(
      bcrypt.compare("ExistingPassword!23", existing.passwordHash),
    ).resolves.toBe(true);
  });

  it("resets an existing admin password only when explicitly forced", async () => {
    const existing = {
      email: "admin@droneviet.vn",
      id: "admin-1",
      passwordHash: await bcrypt.hash("ExistingPassword!23", 12),
      roles: [UserRole.SUPER_ADMIN],
    };
    const repository = {
      create: vi.fn(),
      findOneBy: vi.fn().mockResolvedValue(existing),
      save: vi.fn(async (user) => user),
    };

    await seedAdmin(
      {
        getRepository: vi.fn(() => repository),
      } as never,
      {
        FORCE_RESET_ADMIN_PASSWORD: "true",
        SEED_ADMIN_EMAIL: "admin@droneviet.vn",
        SEED_ADMIN_PASSWORD: "adminadmin12",
      },
    );

    expect(repository.save).toHaveBeenCalledWith(existing);
    await expect(
      bcrypt.compare("adminadmin12", existing.passwordHash),
    ).resolves.toBe(true);
  });
});
