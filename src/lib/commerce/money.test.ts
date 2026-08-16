import { describe, expect, it } from "vitest";
import {
  calculatePriceBreakdown,
  createProductVariantSnapshot,
} from "./money";

describe("calculatePriceBreakdown", () => {
  it("calculates an integer VND total from server-side inputs", () => {
    expect(
      calculatePriceBreakdown({
        lineTotalsVnd: [12_500_000, 950_000],
        discountVnd: 450_000,
        shippingVnd: 80_000,
      }),
    ).toEqual({
      subtotalVnd: 13_450_000,
      discountVnd: 450_000,
      shippingVnd: 80_000,
      totalVnd: 13_080_000,
    });
  });

  it("rejects a discount larger than the subtotal", () => {
    expect(() =>
      calculatePriceBreakdown({
        lineTotalsVnd: [500_000],
        discountVnd: 500_001,
        shippingVnd: 0,
      }),
    ).toThrow("Discount cannot exceed the subtotal");
  });
});

describe("createProductVariantSnapshot", () => {
  it("preserves the API-calculated price when a cart line becomes an order line", () => {
    expect(
      createProductVariantSnapshot({
        variantId: "variant-primary-lab-fly-more",
        sku: "DV-PL-FM",
        title: "DV Primary Lab Fly More",
        unitPriceVnd: 12_500_000,
        quantity: 2,
      }),
    ).toEqual({
      variantId: "variant-primary-lab-fly-more",
      sku: "DV-PL-FM",
      title: "DV Primary Lab Fly More",
      unitPriceVnd: 12_500_000,
      quantity: 2,
      lineTotalVnd: 25_000_000,
    });
  });
});
