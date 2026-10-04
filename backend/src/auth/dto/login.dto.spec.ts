import { validate } from "class-validator";
import { describe, expect, it } from "vitest";
import { LoginDto } from "./login.dto";

describe("LoginDto", () => {
  it("accepts the documented local administrator password", async () => {
    const input = Object.assign(new LoginDto(), {
      email: "admin@droneviet.vn",
      password: "admin123",
    });

    expect(await validate(input)).toHaveLength(0);
  });
});
