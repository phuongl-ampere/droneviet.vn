import { describe, expect, it, vi } from "vitest";
import { OrderPaymentMethod } from "../orders/entities/order.entity";
import { OrderStatus } from "../orders/order-workflow";
import { PaymentProvider, PaymentStatus } from "./entities/payment-attempt.entity";
import { PaymentsService } from "./payments.service";

describe("PaymentsService", () => {
  it("creates one PayOS attempt for an eligible pending-payment order", async () => {
    const orderRepository = {
      save: vi.fn(async (order) => order),
    };
    const paymentRepository = {
      create: vi.fn((attempt) => attempt),
      save: vi.fn(async (attempt) => ({ ...attempt, id: "payment-1" })),
    };
    const payos = {
      createPaymentLink: vi.fn().mockResolvedValue("https://pay.example/1"),
    };
    const service = new PaymentsService(
      orderRepository as never,
      paymentRepository as never,
      payos as never,
    );

    await expect(
      service.createPayosCheckout({
        contactEmail: "buyer@example.vn",
        contactName: "Nguyen Van A",
        contactPhone: "0900000000",
        id: "order-1",
        orderNumber: "DV-ABCD1234",
        paymentMethod: OrderPaymentMethod.PAYOS,
        paymentOrderCode: 123456,
        status: OrderStatus.PENDING_PAYMENT,
        totalVnd: 9_500_000,
      }),
    ).resolves.toEqual({
      checkoutUrl: "https://pay.example/1",
      paymentAttemptId: "payment-1",
    });
    expect(paymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amountVnd: 9_500_000,
        orderId: "order-1",
        provider: PaymentProvider.PAYOS,
        providerOrderCode: 123456,
        status: PaymentStatus.PENDING,
      }),
    );
  });

  it("marks a matching pending attempt and its order as paid only once", async () => {
    const order = {
      id: "order-1",
      status: OrderStatus.PENDING_PAYMENT,
    };
    const payment = {
      amountVnd: 9_500_000,
      id: "payment-1",
      order,
      orderId: "order-1",
      provider: PaymentProvider.PAYOS,
      providerOrderCode: 123456,
      status: PaymentStatus.PENDING,
    };
    const orderRepository = { save: vi.fn(async (value) => value) };
    const paymentRepository = { save: vi.fn(async (value) => value) };
    const payos = {
      verifyWebhookSignature: vi.fn().mockReturnValue(true),
    };
    const service = new PaymentsService(
      orderRepository as never,
      paymentRepository as never,
      payos as never,
    );

    await expect(
      service.completePayosAttempt(payment as never, {
        amount: 9_500_000,
        id: "provider-1",
        orderCode: 123456,
        status: "PAID",
      }),
    ).resolves.toBe(true);
    expect(order.status).toBe(OrderStatus.PAID);
    expect(payment.status).toBe(PaymentStatus.PAID);
  });

  it("rejects a webhook with an invalid signature before looking up payments", async () => {
    const paymentRepository = {
      findOne: vi.fn(),
    };
    const payos = {
      verifyWebhookSignature: vi.fn().mockReturnValue(false),
    };
    const service = new PaymentsService(
      {} as never,
      paymentRepository as never,
      payos as never,
    );

    await expect(
      service.handlePayosWebhook(
        {
          amount: 9_500_000,
          orderCode: 123456,
          status: "PAID",
        },
        "invalid-signature",
      ),
    ).resolves.toBe(false);
    expect(paymentRepository.findOne).not.toHaveBeenCalled();
  });
});
