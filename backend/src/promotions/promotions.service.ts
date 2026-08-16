import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { calculatePromotionDiscount } from "./promo-discount";
import { PromoCode, PromoType } from "./entities/promo-code.entity";

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoRepository: Repository<PromoCode>,
  ) {}

  async resolveDiscount(code: string, subtotalVnd: number): Promise<{
    code: string;
    discountVnd: number;
  }> {
    const normalizedCode = code.trim().toUpperCase();
    const promo = await this.promoRepository.findOneBy({ code: normalizedCode });
    const now = new Date();

    if (
      !promo ||
      !promo.isActive ||
      (promo.startsAt && promo.startsAt > now) ||
      (promo.endsAt && promo.endsAt < now) ||
      (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit)
    ) {
      throw new BadRequestException("Promotion code is unavailable");
    }

    return {
      code: promo.code,
      discountVnd: calculatePromotionDiscount(
        {
          maxDiscountVnd: promo.maxDiscountVnd ?? undefined,
          minimumOrderVnd: promo.minimumOrderVnd ?? undefined,
          type:
            promo.type === PromoType.PERCENTAGE ? "percentage" : "fixed",
          value: promo.value,
        },
        subtotalVnd,
      ),
    };
  }
}
