import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../orders/entities/order.entity";
import { InventoryModule } from "../inventory/inventory.module";
import { CoursesModule } from "../courses/courses.module";
import { PaymentAttempt } from "./entities/payment-attempt.entity";
import { PayosService } from "./payos.service";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  imports: [
    CoursesModule,
    InventoryModule,
    TypeOrmModule.forFeature([Order, PaymentAttempt]),
  ],
  controllers: [PaymentsController],
  providers: [PayosService, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
