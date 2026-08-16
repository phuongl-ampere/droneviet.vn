import { describe, expect, it } from "vitest";
import { calculatePromotionDiscount } from "./promo-discount";

describe("calculatePromotionDiscount", () => {
  it("caps a percentage promotion at its configured maximum", () => {
    expect(
      calculatePromotionDiscount(
        {
          maxDiscountVnd: 1_000_000,
          minimumOrderVnd: 5_000_000,
          type: "percentage",
          value: 20,
        },
        9_500_000,
      ),
    ).toBe(1_000_000);
  });

  it("rejects promotions below their minimum order threshold", () => {
    expect(
      calculatePromotionDiscount(
        {
          minimumOrderVnd: 5_000_000,
          type: "fixed",
          value: 500_000,
        },
        4_999_000,
      ),
    ).toBe(0);
  });
});
