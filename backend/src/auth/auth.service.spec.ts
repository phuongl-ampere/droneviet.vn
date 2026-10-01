import * as bcrypt from "bcrypt";
import { describe, expect, it, vi } from "vitest";
import { UserRole } from "./entities/user.entity";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  it("creates an access token containing the authenticated user's roles", async () => {
    const passwordHash = await bcrypt.hash("StrongPassword!23", 10);
    const userRepository = {
      findOneBy: vi.fn().mockResolvedValue({
        email: "catalog@droneviet.vn",
        displayName: "Catalog Manager",
        id: "user-catalog",
        passwordHash,
        phone: null,
        roles: [UserRole.CATALOG_MANAGER],
      }),
    };
    const jwtService = {
      signAsync: vi.fn().mockResolvedValue("signed-access-token"),
    };
    const service = new AuthService(
      userRepository as never,
      jwtService as never,
    );

    await expect(
      service.login({
        email: "catalog@droneviet.vn",
        password: "StrongPassword!23",
      }),
    ).resolves.toEqual({
      accessToken: "signed-access-token",
      user: {
        displayName: "Catalog Manager",
        email: "catalog@droneviet.vn",
        id: "user-catalog",
        phone: null,
        roles: [UserRole.CATALOG_MANAGER],
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      email: "catalog@droneviet.vn",
      roles: [UserRole.CATALOG_MANAGER],
      sub: "user-catalog",
    });
  });

  it("registers a customer account with the customer role", async () => {
    const userRepository = {
      create: vi.fn((user) => user),
      findOneBy: vi.fn().mockResolvedValue(null),
      save: vi.fn(async (user) => ({ ...user, id: "customer-1" })),
    };
    const jwtService = {
      signAsync: vi.fn().mockResolvedValue("customer-access-token"),
    };
    const service = new AuthService(
      userRepository as never,
      jwtService as never,
    );

    await expect(
      service.register({
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        password: "StrongPassword!23",
      }),
    ).resolves.toEqual({
      accessToken: "customer-access-token",
      user: {
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: null,
        roles: [UserRole.CUSTOMER],
      },
    });
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        roles: [UserRole.CUSTOMER],
      }),
    );
  });

  it("returns a safe profile and persists editable contact information", async () => {
    const user = {
      displayName: "Customer",
      email: "customer@example.vn",
      id: "customer-1",
      phone: null,
      roles: [UserRole.CUSTOMER],
    };
    const userRepository = {
      findOneBy: vi.fn().mockResolvedValue(user),
      save: vi.fn(async (nextUser) => nextUser),
    };
    const service = new AuthService(
      userRepository as never,
      { signAsync: vi.fn() } as never,
    );

    await expect(service.profile("customer-1")).resolves.toEqual(user);
    await expect(
      service.updateProfile("customer-1", {
        displayName: "Nguyen Van A",
        phone: "0901234567",
      }),
    ).resolves.toEqual({
      ...user,
      displayName: "Nguyen Van A",
      phone: "0901234567",
    });
  });
});
