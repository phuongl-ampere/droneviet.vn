import { describe, expect, it, vi } from "vitest";
import { OrderPaymentMethod } from "../orders/entities/order.entity";
import { OrderStatus } from "../orders/order-workflow";
import { PaymentProvider, PaymentStatus } from "./entities/payment-attempt.entity";
import { PaymentsService } from "./payments.service";

describe("PaymentsService", () => {
  it("creates one PayOS attempt for an eligible pending-payment order", async () => {
    const paymentRepository = {
      create: vi.fn((attempt) => attempt),
      save: vi.fn(async (attempt) => ({ ...attempt, id: "payment-1" })),
    };
    const manager = {
      getRepository: vi.fn(() => paymentRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const payos = {
      createPaymentLink: vi.fn().mockResolvedValue("https://pay.example/1"),
    };
    const service = new PaymentsService(
      dataSource as never,
      payos as never,
      {} as never,
      {} as never,
      { recordWithManager: vi.fn() } as never,
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

  it("returns the stored pending checkout URL instead of creating a duplicate PayOS link", async () => {
    const paymentRepository = {
      findOne: vi.fn().mockResolvedValue({
        checkoutUrl: "https://pay.example/existing",
        status: PaymentStatus.PENDING,
      }),
    };
    const dataSource = {
      getRepository: vi.fn(() => paymentRepository),
      transaction: vi.fn(),
    };
    const payos = { createPaymentLink: vi.fn() };
    const service = new PaymentsService(
      dataSource as never,
      payos as never,
      {} as never,
      {} as never,
      { recordWithManager: vi.fn() } as never,
    );

    await expect(
      service.resumePayosCheckout({
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
    ).resolves.toEqual({ checkoutUrl: "https://pay.example/existing" });

    expect(paymentRepository.findOne).toHaveBeenCalledWith({
      order: { createdAt: "DESC" },
      where: {
        orderId: "order-1",
        provider: PaymentProvider.PAYOS,
        status: PaymentStatus.PENDING,
      },
    });
    expect(payos.createPaymentLink).not.toHaveBeenCalled();
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
    const paymentRepository = {
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(payment),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(async (value) => value),
    };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "PaymentAttempt" ? paymentRepository : orderRepository,
      ),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const payos = {
      verifyWebhookSignature: vi.fn().mockReturnValue(true),
    };
    const audit = { recordWithManager: vi.fn() };
    const reservations = {
      commitForOrder: vi.fn(),
      releaseForOrder: vi.fn(),
    };
    const service = new PaymentsService(
      dataSource as never,
      payos as never,
      reservations as never,
      { confirmEnrollmentsForOrder: vi.fn() } as never,
      audit as never,
    );

    await expect(
      service.completePayosAttempt(payment as never, {
        amount: 9_500_000,
        id: "provider-1",
        orderCode: 123456,
        status: "PAID",
      }),
    ).resolves.toBe(true);
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
    expect(reservations.commitForOrder).toHaveBeenCalledOnce();
    expect(reservations.commitForOrder).toHaveBeenCalledWith(manager, order);
    expect(audit.recordWithManager).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({
        action: "order.payment_paid",
        aggregateType: "order",
      }),
    );
  });

  it("commits reserved stock when repairing an already-paid attempt", async () => {
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
      status: PaymentStatus.PAID,
    };
    const orderRepository = { save: vi.fn(async (value) => value) };
    const paymentRepository = {
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(payment),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
    };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "PaymentAttempt" ? paymentRepository : orderRepository,
      ),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const reservations = { commitForOrder: vi.fn() };
    const service = new PaymentsService(
      dataSource as never,
      { verifyWebhookSignature: vi.fn().mockReturnValue(true) } as never,
      reservations as never,
      { confirmEnrollmentsForOrder: vi.fn() } as never,
      { recordWithManager: vi.fn() } as never,
    );

    await expect(
      service.completePayosAttempt(payment as never, {
        amount: 9_500_000,
        orderCode: 123456,
        status: "PAID",
      }),
    ).resolves.toBe(true);

    expect(reservations.commitForOrder).toHaveBeenCalledWith(manager, order);
    expect(order.status).toBe(OrderStatus.PAID);
  });

  it("flags a late paid callback for refund after reservation expiry", async () => {
    const order = {
      id: "order-1",
      status: OrderStatus.PAYMENT_FAILED,
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
    const paymentRepository = {
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(payment),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(async (value) => value),
    };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "PaymentAttempt" ? paymentRepository : orderRepository,
      ),
    };
    const service = new PaymentsService(
      { transaction: vi.fn((callback) => callback(manager)) } as never,
      { verifyWebhookSignature: vi.fn().mockReturnValue(true) } as never,
      { commitForOrder: vi.fn() } as never,
      { confirmEnrollmentsForOrder: vi.fn() } as never,
      { recordWithManager: vi.fn() } as never,
    );

    await expect(
      service.completePayosAttempt(payment as never, {
        amount: 9_500_000,
        orderCode: 123456,
        status: "PAID",
      }),
    ).resolves.toBe(true);

    expect(payment.status).toBe(PaymentStatus.PAID);
    expect(order.status).toBe(OrderStatus.REFUND_REQUESTED);
  });

  it("rejects a webhook with an invalid signature before looking up payments", async () => {
    const dataSource = { transaction: vi.fn() };
    const payos = {
      verifyWebhookSignature: vi.fn().mockReturnValue(false),
    };
    const service = new PaymentsService(
      dataSource as never,
      payos as never,
      {} as never,
      {} as never,
      { recordWithManager: vi.fn() } as never,
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
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it("releases stock when PayOS cancels an unpaid payment attempt", async () => {
    const order = {
      id: "order-1",
      lines: [{ productVariantId: "variant-primary", quantity: 1 }],
      reservationExpiresAt: new Date(),
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
    const paymentRepository = {
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(payment),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const orderRepository = { save: vi.fn() };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "PaymentAttempt" ? paymentRepository : orderRepository,
      ),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const reservations = { releaseForOrder: vi.fn() };
    const courses = { releaseEnrollmentsForOrder: vi.fn() };
    const service = new PaymentsService(
      dataSource as never,
      { verifyWebhookSignature: vi.fn() } as never,
      reservations as never,
      courses as never,
      { recordWithManager: vi.fn() } as never,
    );

    await expect(
      service.completePayosAttempt(payment as never, {
        amount: 9_500_000,
        orderCode: 123456,
        status: "CANCELLED",
      }),
    ).resolves.toBe(true);

    expect(reservations.releaseForOrder).toHaveBeenCalledWith(manager, order);
    expect(courses.releaseEnrollmentsForOrder).toHaveBeenCalledWith(
      manager,
      "order-1",
    );
    expect(payment.status).toBe(PaymentStatus.FAILED);
    expect(order.status).toBe(OrderStatus.PAYMENT_FAILED);
  });

  it("does not release stock twice when a cancellation callback is replayed", async () => {
    const order = {
      id: "order-1",
      lines: [{ productVariantId: "variant-primary", quantity: 1 }],
      reservationExpiresAt: null,
      status: OrderStatus.PAYMENT_FAILED,
    };
    const payment = {
      amountVnd: 9_500_000,
      id: "payment-1",
      order,
      orderId: "order-1",
      provider: PaymentProvider.PAYOS,
      providerOrderCode: 123456,
      status: PaymentStatus.FAILED,
    };
    const paymentRepository = {
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(payment),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const manager = {
      getRepository: vi.fn(() => paymentRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const reservations = { releaseForOrder: vi.fn() };
    const courses = { releaseEnrollmentsForOrder: vi.fn() };
    const service = new PaymentsService(
      dataSource as never,
      { verifyWebhookSignature: vi.fn() } as never,
      reservations as never,
      courses as never,
      { recordWithManager: vi.fn() } as never,
    );

    await expect(
      service.completePayosAttempt(payment as never, {
        amount: 9_500_000,
        orderCode: 123456,
        status: "CANCELLED",
      }),
    ).resolves.toBe(true);

    expect(reservations.releaseForOrder).not.toHaveBeenCalled();
  });

  it("does not move fulfilled orders back to paid on a replayed payment", async () => {
    const order = {
      id: "order-1",
      lines: [],
      reservationExpiresAt: null,
      status: OrderStatus.PACKING,
    };
    const payment = {
      amountVnd: 9_500_000,
      id: "payment-1",
      order,
      orderId: "order-1",
      provider: PaymentProvider.PAYOS,
      providerOrderCode: 123456,
      status: PaymentStatus.PAID,
    };
    const paymentRepository = {
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(payment),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
    };
    const orderRepository = { save: vi.fn() };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "PaymentAttempt" ? paymentRepository : orderRepository,
      ),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const service = new PaymentsService(
      dataSource as never,
      { verifyWebhookSignature: vi.fn() } as never,
      {} as never,
      { confirmEnrollmentsForOrder: vi.fn() } as never,
      { recordWithManager: vi.fn() } as never,
    );

    await expect(
      service.completePayosAttempt(payment as never, {
        amount: 9_500_000,
        orderCode: 123456,
        status: "PAID",
      }),
    ).resolves.toBe(true);

    expect(order.status).toBe(OrderStatus.PACKING);
    expect(orderRepository.save).not.toHaveBeenCalled();
  });
});
