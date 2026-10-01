import { describe, expect, it } from "vitest";
import { resolveCommerceApiOrigin } from "./commerce-api-url";

describe("resolveCommerceApiOrigin", () => {
  it("uses the browser loopback hostname for a loopback API", () => {
    expect(
      resolveCommerceApiOrigin("http://127.0.0.1:4000", "localhost"),
    ).toBe("http://localhost:4000");
    expect(
      resolveCommerceApiOrigin("http://localhost:4000", "127.0.0.1"),
    ).toBe("http://127.0.0.1:4000");
  });

  it("does not rewrite a non-loopback API origin", () => {
    expect(
      resolveCommerceApiOrigin("https://api.droneviet.vn", "localhost"),
    ).toBe("https://api.droneviet.vn");
  });
});
