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
        id: "user-catalog",
        passwordHash,
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
        email: "catalog@droneviet.vn",
        id: "user-catalog",
        roles: [UserRole.CATALOG_MANAGER],
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      email: "catalog@droneviet.vn",
      roles: [UserRole.CATALOG_MANAGER],
      sub: "user-catalog",
    });
  });
});
