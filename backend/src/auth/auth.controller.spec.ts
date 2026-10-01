import { describe, expect, it, vi } from "vitest";
import { AuthController } from "./auth.controller";

describe("AuthController", () => {
  it("sets an HttpOnly cookie without removing the access token response", async () => {
    const session = {
      accessToken: "signed-access-token",
      user: {
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: null,
        roles: ["customer"],
      },
    };
    const authService = {
      login: vi.fn().mockResolvedValue(session),
    };
    const controller = new AuthController(authService as never);
    const response = { cookie: vi.fn() };

    await expect(
      controller.login(
        {
          email: "customer@example.vn",
          password: "StrongPassword!23",
        },
        response as never,
      ),
    ).resolves.toEqual(session);
    expect(response.cookie).toHaveBeenCalledWith(
      "droneviet_access",
      "signed-access-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      }),
    );
  });

  it("returns and updates only the authenticated profile", async () => {
    const authService = {
      profile: vi.fn().mockResolvedValue({
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: null,
        roles: ["customer"],
      }),
      updateProfile: vi.fn().mockResolvedValue({
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: "0901234567",
        roles: ["customer"],
      }),
    };
    const controller = new AuthController(authService as never);
    const request = { user: { sub: "customer-1" } };

    await expect(controller.profile(request as never)).resolves.toMatchObject({
      id: "customer-1",
    });
    await expect(
      controller.updateProfile(
        { displayName: "Nguyen Van A", phone: "0901234567" },
        request as never,
      ),
    ).resolves.toMatchObject({ phone: "0901234567" });
    expect(authService.updateProfile).toHaveBeenCalledWith("customer-1", {
      displayName: "Nguyen Van A",
      phone: "0901234567",
    });
  });

  it("reports an anonymous or authenticated cookie session without exposing a token", async () => {
    const authService = {
      profile: vi.fn().mockResolvedValue({
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: null,
        roles: ["customer"],
      }),
    };
    const controller = new AuthController(authService as never);

    await expect(controller.session({} as never)).resolves.toEqual({
      user: null,
    });
    await expect(
      controller.session({ user: { sub: "customer-1" } } as never),
    ).resolves.toEqual({
      user: expect.objectContaining({ id: "customer-1" }),
    });
  });

  it("clears the session cookie on logout", () => {
    const controller = new AuthController({} as never);
    const response = { clearCookie: vi.fn() };

    controller.logout(response as never);

    expect(response.clearCookie).toHaveBeenCalledWith("droneviet_access", {
      path: "/",
    });
  });
});
