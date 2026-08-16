import { describe, expect, it } from "vitest";
import { ShippingService } from "./shipping.service";

describe("ShippingService", () => {
  it("returns a manual-contact fallback when no carrier integration is configured", async () => {
    const service = new ShippingService();

    await expect(
      service.estimate({
        productPriceVnd: 9_500_000,
        receiverProvince: "Ho Chi Minh City",
        weightG: 650,
      }),
    ).resolves.toEqual({
      amountVnd: null,
      carrier: "manual",
      note: "Drone Viet will confirm delivery cost before fulfillment.",
      pricingStatus: "manual_quote",
    });
  });
});
