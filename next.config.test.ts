import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("legacy solution redirects", () => {
  it("permanently redirects the retired Vietnamese and English routes", async () => {
    expect(nextConfig.redirects).toBeDefined();
    const redirects = await nextConfig.redirects!();

    expect(redirects).toEqual(
      expect.arrayContaining([
        { source: "/giai-phap", destination: "/dich-vu", permanent: true },
        { source: "/en/solutions", destination: "/en/services", permanent: true },
      ]),
    );
  });
});
