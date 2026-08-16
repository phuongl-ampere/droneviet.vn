import { describe, expect, it } from "vitest";
import { resolveJwtSecret } from "./jwt-config";

describe("resolveJwtSecret", () => {
  it("rejects a production process without a configured access secret", () => {
    expect(() =>
      resolveJwtSecret({
        NODE_ENV: "production",
      }),
    ).toThrow("JWT_ACCESS_SECRET must be configured in production");
  });

  it("uses an explicit secret in production", () => {
    expect(
      resolveJwtSecret({
        JWT_ACCESS_SECRET: "a-production-secret",
        NODE_ENV: "production",
      }),
    ).toBe("a-production-secret");
  });
});
