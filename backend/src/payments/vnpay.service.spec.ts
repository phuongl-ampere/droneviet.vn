import { describe, expect, it, vi } from "vitest";
import { VnpayService } from "./vnpay.service";

describe("VnpayService", () => {
  it("creates a signed checkout URL using VND smallest-unit amount", () => {
    const config = {
      get: vi.fn((key: string, fallback = "") => {
        const values: Record<string, string> = {
          VNPAY_HASH_SECRET: "hash-secret",
          VNPAY_RETURN_URL: "https://store.example/thanh-toan/vnpay",
          VNPAY_TMN_CODE: "TMNCODE",
          VNPAY_URL: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
        };
        return values[key] ?? fallback;
      }),
    };
    const service = new VnpayService(config as never);

    const url = service.createPaymentUrl({
      amountVnd: 9_500_000,
      ipAddress: "::1",
      orderInfo: "Đơn hàng Drone Việt",
      transactionRef: "DV-123456",
    });

    expect(url).toContain("vnp_Amount=950000000");
    expect(url).toContain("vnp_IpAddr=127.0.0.1");
    expect(url).toContain("vnp_SecureHash=");
  });
});
