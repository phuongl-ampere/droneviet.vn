import { describe, expect, it } from "vitest";
import { bigintVndTransformer } from "./bigint-vnd.transformer";

describe("bigintVndTransformer", () => {
  it("serializes institutional VND amounts beyond MySQL INT range", () => {
    const amount = 12_000_000_000;

    expect(bigintVndTransformer.to(amount)).toBe("12000000000");
    expect(bigintVndTransformer.from("12000000000")).toBe(amount);
  });

  it("leaves generated bigint values undefined before database insertion", () => {
    expect(bigintVndTransformer.to(undefined)).toBeUndefined();
  });
});
