import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderLine } from "./entities/order-line.entity";
import { Order } from "./entities/order.entity";
import { InventoryItem } from "../inventory/entities/inventory-item.entity";
import { PaymentsModule } from "../payments/payments.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [
    PaymentsModule,
    TypeOrmModule.forFeature([InventoryItem, Order, OrderLine]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
