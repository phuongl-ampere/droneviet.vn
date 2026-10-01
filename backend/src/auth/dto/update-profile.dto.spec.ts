import { validate } from "class-validator";
import { describe, expect, it } from "vitest";
import { UpdateProfileDto } from "./update-profile.dto";

describe("UpdateProfileDto", () => {
  it("allows a customer to clear an optional phone number", async () => {
    const input = Object.assign(new UpdateProfileDto(), {
      displayName: "Nguyen Van A",
      phone: "",
    });

    await expect(validate(input)).resolves.toEqual([]);
  });
});
