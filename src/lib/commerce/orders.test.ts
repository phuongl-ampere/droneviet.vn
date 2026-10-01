import { afterEach, describe, expect, it, vi } from "vitest";
import { resumePayosPayment } from "./orders";

describe("resumePayosPayment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends the contact phone to the protected guest resume endpoint", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ checkoutUrl: "https://pay.example/resume" }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      resumePayosPayment("DV-123/456", "0900000000"),
    ).resolves.toEqual({ checkoutUrl: "https://pay.example/resume" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/orders/DV-123%2F456/payment-resume",
      expect.objectContaining({
        body: JSON.stringify({ phone: "0900000000" }),
        credentials: "include",
        method: "POST",
      }),
    );
  });
});
