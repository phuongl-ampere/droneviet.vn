import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductVariant } from "../catalog/entities/product-variant.entity";
import { OrderLine } from "./entities/order-line.entity";
import { Order } from "./entities/order.entity";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant, Order, OrderLine])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
