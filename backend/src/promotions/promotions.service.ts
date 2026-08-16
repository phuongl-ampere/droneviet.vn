import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
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

  async consumeDiscount(
    manager: EntityManager,
    code: string,
    subtotalVnd: number,
  ): Promise<{ code: string; discountVnd: number }> {
    const normalizedCode = code.trim().toUpperCase();
    const repository = manager.getRepository(PromoCode);
    const promo = await repository
      .createQueryBuilder("promo")
      .where("promo.code = :code", { code: normalizedCode })
      .setLock("pessimistic_write")
      .getOne();
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

    const discountVnd = calculatePromotionDiscount(
      {
        maxDiscountVnd: promo.maxDiscountVnd ?? undefined,
        minimumOrderVnd: promo.minimumOrderVnd ?? undefined,
        type: promo.type === PromoType.PERCENTAGE ? "percentage" : "fixed",
        value: promo.value,
      },
      subtotalVnd,
    );
    if (discountVnd > 0) {
      promo.usageCount += 1;
      await repository.save(promo);
    }

    return {
      code: promo.code,
      discountVnd,
    };
  }

  async releaseDiscount(manager: EntityManager, code: string): Promise<void> {
    const repository = manager.getRepository(PromoCode);
    const promo = await repository
      .createQueryBuilder("promo")
      .where("promo.code = :code", { code: code.trim().toUpperCase() })
      .setLock("pessimistic_write")
      .getOne();

    if (!promo || promo.usageCount === 0) {
      return;
    }

    promo.usageCount -= 1;
    await repository.save(promo);
  }
}
