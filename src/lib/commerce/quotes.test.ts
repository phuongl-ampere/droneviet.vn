import { afterEach, describe, expect, it, vi } from "vitest";
import { submitQuoteRequest } from "./quotes";

describe("submitQuoteRequest", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("submits organization requirements to the quote API", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ id: "quote-1" }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitQuoteRequest({
        contactName: "Nguyen Van A",
        organization: "Drone Viet School",
        phone: "0900000000",
        quantity: 10,
        requirements: "DV Research Platform",
      }),
    ).resolves.toEqual({ id: "quote-1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/quotes",
      expect.objectContaining({
        body: JSON.stringify({
          contactName: "Nguyen Van A",
          organization: "Drone Viet School",
          phone: "0900000000",
          quantity: 10,
          requirements: "DV Research Platform",
        }),
        method: "POST",
      }),
    );
  });
});
