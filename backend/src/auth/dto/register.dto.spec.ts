import { validate } from "class-validator";
import { describe, expect, it } from "vitest";
import { RegisterDto } from "./register.dto";

describe("RegisterDto", () => {
  it("accepts a six-character password for local registration", async () => {
    const input = Object.assign(new RegisterDto(), {
      displayName: "Nguyen Van A",
      email: "customer@example.vn",
      password: "123456",
    });

    await expect(validate(input)).resolves.toEqual([]);
  });
});
