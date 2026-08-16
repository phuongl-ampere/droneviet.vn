import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../orders/entities/order.entity";
import { InventoryModule } from "../inventory/inventory.module";
import { CoursesModule } from "../courses/courses.module";
import { AuditModule } from "../audit/audit.module";
import { PaymentAttempt } from "./entities/payment-attempt.entity";
import { PayosService } from "./payos.service";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { VnpayService } from "./vnpay.service";

@Module({
  imports: [
    CoursesModule,
    AuditModule,
    InventoryModule,
    TypeOrmModule.forFeature([Order, PaymentAttempt]),
  ],
  controllers: [PaymentsController],
  providers: [PayosService, PaymentsService, VnpayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
