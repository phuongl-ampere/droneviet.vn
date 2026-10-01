import { afterEach, describe, expect, it, vi } from "vitest";
import { researchApi } from "./research-api";

describe("researchApi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends public rating cookies without a bearer token", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ average: 5, count: 1, mine: 5 }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await researchApi.rateArticle("flight-protocol", 5);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/content/research/articles/flight-protocol/rating",
      expect.objectContaining({ credentials: "include", method: "PUT" }),
    );
  });
});
