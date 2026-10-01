import { describe, expect, it } from "vitest";
import { minimumRegistrationPasswordLength } from "./password-policy";

describe("minimumRegistrationPasswordLength", () => {
  it("allows six characters only in development", () => {
    expect(
      minimumRegistrationPasswordLength({ NODE_ENV: "development" }),
    ).toBe(6);
    expect(
      minimumRegistrationPasswordLength({ NODE_ENV: "production" }),
    ).toBe(12);
    expect(minimumRegistrationPasswordLength({ NODE_ENV: "staging" })).toBe(
      12,
    );
    expect(minimumRegistrationPasswordLength({})).toBe(12);
  });
});
