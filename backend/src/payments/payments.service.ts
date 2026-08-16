import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PaymentAttempt)
    private readonly paymentRepository: Repository<PaymentAttempt>,
    private readonly payos: PayosService,
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
    const attempt = await this.paymentRepository.save(
      this.paymentRepository.create({
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

    return { checkoutUrl, paymentAttemptId: attempt.id };
  }

  async completePayosAttempt(
    payment: PaymentAttempt,
    callback: PayosWebhookData,
  ): Promise<boolean> {
    if (payment.status === PaymentStatus.PAID) {
      return true;
    }

    if (
      payment.provider !== PaymentProvider.PAYOS ||
      payment.providerOrderCode !== callback.orderCode ||
      payment.amountVnd !== Math.round(callback.amount) ||
      callback.status !== "PAID" ||
      payment.order.status !== OrderStatus.PENDING_PAYMENT
    ) {
      return false;
    }

    payment.status = PaymentStatus.PAID;
    payment.providerReference = callback.id ?? String(callback.orderCode);
    payment.paidAt = new Date();
    payment.order.status = OrderStatus.PAID;
    await this.paymentRepository.save(payment);
    await this.orderRepository.save(payment.order);

    return true;
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

    const payment = await this.paymentRepository.findOne({
      where: {
        provider: PaymentProvider.PAYOS,
        providerOrderCode: data.orderCode,
      },
      relations: { order: true },
    });

    if (!payment) {
      throw new ServiceUnavailableException("Payment attempt was not found");
    }

    return this.completePayosAttempt(payment, data);
  }
}
