import { describe, expect, it, vi } from "vitest";
import { PromoCode, PromoType } from "./entities/promo-code.entity";
import { PromotionsService } from "./promotions.service";

describe("PromotionsService", () => {
  it("normalizes a valid code and calculates its capped discount", async () => {
    const repository = {
      findOneBy: vi.fn().mockResolvedValue({
        code: "STEM20",
        endsAt: null,
        isActive: true,
        maxDiscountVnd: 1_000_000,
        minimumOrderVnd: 5_000_000,
        startsAt: null,
        type: PromoType.PERCENTAGE,
        usageCount: 0,
        usageLimit: null,
        value: 20,
      } as PromoCode),
    };
    const service = new PromotionsService(repository as never);

    await expect(service.resolveDiscount(" stem20 ", 9_500_000)).resolves.toEqual({
      code: "STEM20",
      discountVnd: 1_000_000,
    });
  });
});
