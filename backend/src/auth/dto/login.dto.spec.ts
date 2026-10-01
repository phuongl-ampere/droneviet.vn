import { validate } from "class-validator";
import { describe, expect, it } from "vitest";
import { LoginDto } from "./login.dto";

describe("LoginDto", () => {
  it("accepts a six-character password for a local customer login", async () => {
    const input = Object.assign(new LoginDto(), {
      email: "customer1@droneviet.vn",
      password: "123456",
    });

    await expect(validate(input)).resolves.toEqual([]);
  });
});
