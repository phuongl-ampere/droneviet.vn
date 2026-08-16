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

  it("locks and consumes a limited promotion inside an order transaction", async () => {
    const promo = {
      code: "ONCE",
      endsAt: null,
      isActive: true,
      maxDiscountVnd: null,
      minimumOrderVnd: null,
      startsAt: null,
      type: PromoType.FIXED,
      usageCount: 0,
      usageLimit: 1,
      value: 500_000,
    };
    const repository = {
      createQueryBuilder: vi.fn(() => ({
        getOne: vi.fn().mockResolvedValue(promo),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(async (value) => value),
    };
    const service = new PromotionsService({} as never);

    await expect(
      service.consumeDiscount(
        { getRepository: vi.fn(() => repository) } as never,
        " once ",
        2_000_000,
      ),
    ).resolves.toEqual({ code: "ONCE", discountVnd: 500_000 });
    expect(promo.usageCount).toBe(1);
    expect(repository.save).toHaveBeenCalledWith(promo);
  });
});
