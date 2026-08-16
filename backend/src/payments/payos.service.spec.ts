import { afterEach, describe, expect, it, vi } from "vitest";
import { PayosService } from "./payos.service";

const fetchMock = vi.fn();

describe("PayosService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a signed PayOS checkout request with a safe transfer description", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      json: async () => ({
        code: "00",
        data: { checkoutUrl: "https://pay.payos.vn/web/checkout" },
      }),
      ok: true,
    });
    const config = {
      get: vi.fn((key: string, fallback = "") => {
        const values: Record<string, string> = {
          PAYOS_API_KEY: "api-key",
          PAYOS_CANCEL_URL: "https://store.example/thanh-toan/huy",
          PAYOS_CHECKSUM_KEY: "checksum-key",
          PAYOS_CLIENT_ID: "client-id",
          PAYOS_RETURN_URL: "https://store.example/thanh-toan/thanh-cong",
        };

        return values[key] ?? fallback;
      }),
    };
    const service = new PayosService(config as never);

    await expect(
      service.createPaymentLink({
        amountVnd: 9_500_000,
        description: "Đơn hàng DV Primary Lab #1",
        orderCode: 123456,
      }),
    ).resolves.toBe("https://pay.payos.vn/web/checkout");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api-merchant.payos.vn/v2/payment-requests",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-api-key": "api-key",
          "x-client-id": "client-id",
        }),
        method: "POST",
      }),
    );
    expect(
      service.verifyWebhookSignature(
        { amount: 9_500_000, orderCode: 123456, status: "PAID" },
        "invalid",
      ),
    ).toBe(false);
  });
});
