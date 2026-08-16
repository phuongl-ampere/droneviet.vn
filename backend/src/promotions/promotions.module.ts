import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PromoCode } from "./entities/promo-code.entity";
import { PromotionsService } from "./promotions.service";

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode])],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
