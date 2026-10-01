import { ExecutionContext } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { JwtAuthGuard } from "./jwt-auth.guard";

function contextFor(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe("JwtAuthGuard", () => {
  it("returns an HTTP 401 error when no customer credential is supplied", async () => {
    const guard = new JwtAuthGuard({ verifyAsync: vi.fn() } as never);

    await expect(
      guard.canActivate(contextFor({ headers: {} })),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("authenticates a request from the HttpOnly access cookie", async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({
        email: "customer@example.vn",
        roles: ["customer"],
        sub: "customer-1",
      }),
    };
    const guard = new JwtAuthGuard(jwtService as never);
    const request = {
      cookies: { droneviet_access: "cookie-access-token" },
      headers: {},
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith("cookie-access-token");
    expect(request).toMatchObject({ user: { sub: "customer-1" } });
  });
});
