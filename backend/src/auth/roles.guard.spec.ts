import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";
import { UserRole } from "./entities/user.entity";
import { RolesGuard } from "./roles.guard";

function createContext(roles: UserRole[]): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: { roles } }),
    }),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  it("allows a catalog manager to access a catalog operation", () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue([UserRole.CATALOG_MANAGER]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext([UserRole.CATALOG_MANAGER]))).toBe(
      true,
    );
  });

  it("rejects a sales user from a catalog operation", () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue([UserRole.CATALOG_MANAGER]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext([UserRole.SALES]))).toBe(false);
  });
});
