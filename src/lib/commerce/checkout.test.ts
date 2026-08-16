import { afterEach, describe, expect, it, vi } from "vitest";
import { submitCheckout } from "./checkout";

describe("submitCheckout", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("posts only server variant IDs and customer fields to the commerce API", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ order: { orderNumber: "DV-123" } }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitCheckout({
        contactName: "Nguyen Van A",
        contactPhone: "0900000000",
        lines: [
          {
            priceVnd: 9_500_000,
            quantity: 1,
            slug: "dv-primary-lab",
            title: "DV Primary Lab",
            variantId: "11111111-1111-4111-8111-111111111111",
          },
        ],
        paymentMethod: "payos",
        shippingAddress: "Ho Chi Minh City",
      }),
    ).resolves.toEqual({ order: { orderNumber: "DV-123" } });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/orders",
      expect.objectContaining({
        body: JSON.stringify({
          contactName: "Nguyen Van A",
          contactPhone: "0900000000",
          lines: [
            {
              courseSessionId: undefined,
              quantity: 1,
              variantId: "11111111-1111-4111-8111-111111111111",
            },
          ],
          paymentMethod: "payos",
          shippingAddress: "Ho Chi Minh City",
        }),
        method: "POST",
      }),
    );
  });
});
