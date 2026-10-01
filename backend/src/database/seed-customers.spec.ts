import * as bcrypt from "bcrypt";
import { describe, expect, it, vi } from "vitest";
import { UserRole } from "../auth/entities/user.entity";
import { seedDemoCustomers } from "./seed-customers";

describe("seedDemoCustomers", () => {
  it("creates the three local customer accounts only when they are absent", async () => {
    const repository = {
      create: vi.fn((user) => user),
      findOneBy: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };

    await seedDemoCustomers(
      { getRepository: vi.fn(() => repository) } as never,
      {
        NODE_ENV: "development",
        SEED_DEMO_CUSTOMER_PASSWORD: "123456",
      },
    );

    expect(repository.create).toHaveBeenCalledTimes(3);
    expect(repository.save).toHaveBeenCalledTimes(3);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "customer1@droneviet.vn",
        roles: [UserRole.CUSTOMER],
      }),
    );
    const firstPasswordHash = repository.create.mock.calls[0][0].passwordHash;
    await expect(bcrypt.compare("123456", firstPasswordHash)).resolves.toBe(true);
  });

  it("does not overwrite an existing customer and refuses non-development environments", async () => {
    const existing = {
      email: "customer1@droneviet.vn",
      passwordHash: await bcrypt.hash("existing-password", 12),
      roles: [UserRole.CUSTOMER],
    };
    const repository = {
      create: vi.fn((user) => user),
      findOneBy: vi.fn().mockResolvedValueOnce(existing).mockResolvedValue(null),
      save: vi.fn(),
    };
    const manager = { getRepository: vi.fn(() => repository) } as never;

    await seedDemoCustomers(manager, {
      NODE_ENV: "development",
      SEED_DEMO_CUSTOMER_PASSWORD: "123456",
    });

    expect(repository.save).toHaveBeenCalledTimes(2);
    await expect(
      seedDemoCustomers(manager, { NODE_ENV: "production" }),
    ).rejects.toThrow("DEMO_CUSTOMER_SEED_FORBIDDEN");
    await expect(
      seedDemoCustomers(manager, { NODE_ENV: "staging" }),
    ).rejects.toThrow("DEMO_CUSTOMER_SEED_FORBIDDEN");
  });
});
