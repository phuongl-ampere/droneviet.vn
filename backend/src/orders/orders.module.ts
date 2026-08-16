import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderLine } from "./entities/order-line.entity";
import { Order } from "./entities/order.entity";
import { InventoryItem } from "../inventory/entities/inventory-item.entity";
import { InventoryModule } from "../inventory/inventory.module";
import { AuditModule } from "../audit/audit.module";
import { CoursesModule } from "../courses/courses.module";
import { PaymentsModule } from "../payments/payments.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { ReservationCleanupService } from "./reservation-cleanup.service";

@Module({
  imports: [
    PaymentsModule,
    AuditModule,
    InventoryModule,
    CoursesModule,
    TypeOrmModule.forFeature([InventoryItem, Order, OrderLine]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ReservationCleanupService],
  exports: [OrdersService],
})
export class OrdersModule {}
