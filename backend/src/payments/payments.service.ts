import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager } from "typeorm";
import { InventoryReservationService } from "../inventory/inventory-reservation.service";
import { CoursesService } from "../courses/courses.service";
import { AuditService } from "../audit/audit.service";
import { Order, OrderPaymentMethod } from "../orders/entities/order.entity";
import { OrderStatus } from "../orders/order-workflow";
import { PayosService } from "./payos.service";
import {
  PaymentAttempt,
  PaymentProvider,
  PaymentStatus,
} from "./entities/payment-attempt.entity";

interface PayosWebhookData {
  amount: number;
  id?: string;
  orderCode: number;
  status: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly payos: PayosService,
    private readonly reservations: InventoryReservationService,
    private readonly courses: CoursesService,
    private readonly audit: AuditService,
  ) {}

  async createPayosCheckout(
    order: Pick<
      Order,
      | "contactEmail"
      | "contactName"
      | "contactPhone"
      | "id"
      | "orderNumber"
      | "paymentMethod"
      | "paymentOrderCode"
      | "status"
      | "totalVnd"
    >,
  ): Promise<{ checkoutUrl: string; paymentAttemptId: string }> {
    if (
      order.paymentMethod !== OrderPaymentMethod.PAYOS ||
      order.status !== OrderStatus.PENDING_PAYMENT
    ) {
      throw new BadRequestException("Order is not eligible for PayOS checkout");
    }

    const checkoutUrl = await this.payos.createPaymentLink({
      amountVnd: order.totalVnd,
      buyerEmail: order.contactEmail ?? undefined,
      buyerName: order.contactName,
      buyerPhone: order.contactPhone,
      description: `DH ${order.orderNumber}`,
      orderCode: order.paymentOrderCode,
    });
    const attempt = await this.dataSource.transaction(async (manager) => {
      const paymentRepository = manager.getRepository(PaymentAttempt);

      return paymentRepository.save(
        paymentRepository.create({
          amountVnd: order.totalVnd,
          checkoutUrl,
          orderId: order.id,
          paidAt: null,
          provider: PaymentProvider.PAYOS,
          providerOrderCode: order.paymentOrderCode,
          providerReference: null,
          status: PaymentStatus.PENDING,
        }),
      );
    });

    return { checkoutUrl, paymentAttemptId: attempt.id };
  }

  async completePayosAttempt(
    payment: PaymentAttempt,
    callback: PayosWebhookData,
  ): Promise<boolean> {
    return this.dataSource.transaction((manager) =>
      this.settlePayosPayment(manager, payment.id, callback),
    );
  }

  async handlePayosWebhook(
    data: PayosWebhookData,
    signature: string,
  ): Promise<boolean> {
    if (
      !this.payos.verifyWebhookSignature(
        data as unknown as Record<string, unknown>,
        signature,
      )
    ) {
      return false;
    }

    return this.dataSource.transaction(async (manager) => {
      const payment = await this.findPayosPaymentForUpdate(manager, {
        orderCode: data.orderCode,
      });

      if (!payment) {
        throw new ServiceUnavailableException("Payment attempt was not found");
      }

      return this.settlePayosPayment(manager, payment.id, data);
    });
  }

  private async findPayosPaymentForUpdate(
    manager: EntityManager,
    filter: { id?: string; orderCode?: number },
  ): Promise<PaymentAttempt | null> {
    const builder = manager
      .getRepository(PaymentAttempt)
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.order", "order")
      .leftJoinAndSelect("order.lines", "line")
      .where("payment.provider = :provider", { provider: PaymentProvider.PAYOS })
      .setLock("pessimistic_write");

    if (filter.id) {
      builder.andWhere("payment.id = :id", { id: filter.id });
    }

    if (filter.orderCode) {
      builder.andWhere("payment.providerOrderCode = :orderCode", {
        orderCode: filter.orderCode,
      });
    }

    return builder.getOne();
  }

  private async settlePayosPayment(
    manager: EntityManager,
    paymentId: string,
    callback: PayosWebhookData,
  ): Promise<boolean> {
    const payment = await this.findPayosPaymentForUpdate(manager, {
      id: paymentId,
    });

    if (!payment) {
      return false;
    }

    if (
      payment.providerOrderCode !== callback.orderCode ||
      payment.amountVnd !== Math.round(callback.amount)
    ) {
      return false;
    }

    const paymentRepository = manager.getRepository(PaymentAttempt);
    const orderRepository = manager.getRepository(Order);

    if (payment.status === PaymentStatus.PAID) {
      if (payment.order.status === OrderStatus.PENDING_PAYMENT) {
        payment.order.status = OrderStatus.PAID;
        payment.order.reservationExpiresAt = null;
        await this.reservations.commitForOrder(manager, payment.order);
        await this.courses.confirmEnrollmentsForOrder(manager, payment.order.id);
        await orderRepository.save(payment.order);
        await this.audit.recordWithManager(manager, {
          action: "order.payment_repaired",
          aggregateId: payment.order.id,
          aggregateType: "order",
          nextState: { status: payment.order.status },
          previousState: { status: OrderStatus.PENDING_PAYMENT },
        });
      }

      return true;
    }

    if (callback.status === "PAID") {
      if (payment.order.status !== OrderStatus.PENDING_PAYMENT) {
        return false;
      }

      payment.status = PaymentStatus.PAID;
      payment.providerReference = callback.id ?? String(callback.orderCode);
      payment.paidAt = new Date();
      payment.order.status = OrderStatus.PAID;
      payment.order.reservationExpiresAt = null;
      await paymentRepository.save(payment);
      await this.reservations.commitForOrder(manager, payment.order);
      await this.courses.confirmEnrollmentsForOrder(manager, payment.order.id);
      await orderRepository.save(payment.order);
      await this.audit.recordWithManager(manager, {
        action: "order.payment_paid",
        aggregateId: payment.order.id,
        aggregateType: "order",
        nextState: { status: payment.order.status },
        previousState: { status: OrderStatus.PENDING_PAYMENT },
      });
      return true;
    }

    if (callback.status === "CANCELLED" || callback.status === "EXPIRED") {
      if (payment.order.status !== OrderStatus.PENDING_PAYMENT) {
        return true;
      }

      payment.status = PaymentStatus.FAILED;
      await this.reservations.releaseForOrder(manager, payment.order);
      await this.courses.releaseEnrollmentsForOrder(manager, payment.order.id);
      payment.order.status = OrderStatus.PAYMENT_FAILED;
      payment.order.reservationExpiresAt = null;
      await paymentRepository.save(payment);
      await orderRepository.save(payment.order);
      await this.audit.recordWithManager(manager, {
        action: "order.payment_failed",
        aggregateId: payment.order.id,
        aggregateType: "order",
        nextState: { status: payment.order.status },
        previousState: { status: OrderStatus.PENDING_PAYMENT },
      });
      return true;
    }

    return false;
  }
}
