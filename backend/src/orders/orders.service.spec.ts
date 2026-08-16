import { describe, expect, it, vi } from "vitest";
import { PurchaseMode } from "../catalog/entities/product-variant.entity";
import { OrderPaymentMethod } from "./entities/order.entity";
import { OrderStatus } from "./order-workflow";
import { OrdersService } from "./orders.service";

describe("OrdersService", () => {
  it("recalculates direct-purchase SKU prices and snapshots order lines", async () => {
    const variantRepository = {
      createQueryBuilder: vi.fn(() => ({
        getMany: vi.fn().mockResolvedValue([
          {
            id: "variant-primary-lab",
            inventory: { id: "inventory-primary", onHand: 3, reserved: 0 },
            isActive: true,
            priceVnd: 9_500_000,
            product: { name: "DV Primary Lab", status: "published" },
            purchaseMode: PurchaseMode.CHECKOUT,
            sku: "DV-PL-STD",
            title: "Standard kit",
          },
        ]),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
    };
    const orderRepository = {
      create: vi.fn((order) => order),
      save: vi.fn(async (order) => ({ ...order, id: "order-1" })),
    };
    const orderLineRepository = {
      create: vi.fn((line) => line),
      save: vi.fn(async (lines) => lines),
    };
    const manager = {
      getRepository: vi.fn((entity) => {
        if (entity.name === "ProductVariant") return variantRepository;
        if (entity.name === "Order") return orderRepository;
        return orderLineRepository;
      }),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const reservationService = { reserve: vi.fn() };
    const audit = { recordWithManager: vi.fn() };
    const service = new OrdersService(
      dataSource as never,
      reservationService as never,
      { reserveEnrollmentWithManager: vi.fn() } as never,
      audit as never,
      { resolveDiscount: vi.fn() } as never,
    );

    await expect(
      service.createOrder({
        contactName: "Nguyen Van A",
        contactPhone: "0900000000",
        lines: [{ quantity: 2, variantId: "variant-primary-lab" }],
        paymentMethod: OrderPaymentMethod.PAYOS,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        status: OrderStatus.PENDING_PAYMENT,
        totalVnd: 19_000_000,
      }),
    );
    expect(orderLineRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 2,
        sku: "DV-PL-STD",
        title: "DV Primary Lab - Standard kit",
        unitPriceVnd: 9_500_000,
      }),
    );
    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(reservationService.reserve).toHaveBeenCalledWith(
      manager,
      expect.arrayContaining([
        expect.objectContaining({
          productVariantId: "variant-primary-lab",
          quantity: 2,
        }),
      ]),
    );
    expect(audit.recordWithManager).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({
        action: "order.created",
        aggregateType: "order",
      }),
    );
  });

  it("rejects an active variant whose parent product is still a draft", async () => {
    const variantRepository = {
      createQueryBuilder: vi.fn(() => ({
        getMany: vi.fn().mockResolvedValue([
          {
            id: "variant-draft",
            inventory: { id: "inventory-draft", onHand: 1, reserved: 0 },
            isActive: true,
            priceVnd: 9_500_000,
            product: { name: "Draft kit", status: "draft" },
            purchaseMode: PurchaseMode.CHECKOUT,
            sku: "DV-DRAFT",
            title: "Draft",
          },
        ]),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
    };
    const manager = {
      getRepository: vi.fn((entity) => {
        if (entity.name === "ProductVariant") return variantRepository;
        return { create: vi.fn(), save: vi.fn() };
      }),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const service = new OrdersService(
      dataSource as never,
      { reserve: vi.fn() } as never,
      { reserveEnrollmentWithManager: vi.fn() } as never,
      { recordWithManager: vi.fn() } as never,
      { resolveDiscount: vi.fn() } as never,
    );

    await expect(
      service.createOrder({
        contactName: "Nguyen Van A",
        contactPhone: "0900000000",
        lines: [{ quantity: 1, variantId: "variant-draft" }],
        paymentMethod: OrderPaymentMethod.PAYOS,
      }),
    ).rejects.toThrow("Variant variant-draft is unavailable");
  });

  it("reserves a scheduled course seat when an order includes a course session", async () => {
    const variantRepository = {
      createQueryBuilder: vi.fn(() => ({
        getMany: vi.fn().mockResolvedValue([
          {
            id: "variant-course-g1",
            isActive: true,
            priceVnd: 2_400_000,
            product: {
              kind: "course",
              name: "Drone nhập môn cho cấp 1",
              status: "published",
            },
            purchaseMode: PurchaseMode.CHECKOUT,
            sku: "DV-COURSE-G1",
            title: "Khai giảng 14/09",
          },
        ]),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
    };
    const orderRepository = {
      create: vi.fn((order) => order),
      save: vi.fn(async (order) => ({ ...order, id: "order-course-1" })),
    };
    const orderLineRepository = {
      create: vi.fn((line) => line),
      save: vi.fn(),
    };
    const manager = {
      getRepository: vi.fn((entity) => {
        if (entity.name === "ProductVariant") return variantRepository;
        if (entity.name === "Order") return orderRepository;
        return orderLineRepository;
      }),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const courses = { reserveEnrollmentWithManager: vi.fn() };
    const service = new OrdersService(
      dataSource as never,
      { reserve: vi.fn() } as never,
      courses as never,
      { recordWithManager: vi.fn() } as never,
      { resolveDiscount: vi.fn() } as never,
    );

    await service.createOrder({
      contactName: "Nguyen Van A",
      contactPhone: "0900000000",
      lines: [
        {
          courseSessionId: "session-g1",
          quantity: 1,
          variantId: "variant-course-g1",
        },
      ],
      paymentMethod: OrderPaymentMethod.PAYOS,
    });

    expect(courses.reserveEnrollmentWithManager).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({
        orderId: "order-course-1",
        sessionId: "session-g1",
      }),
    );
  });

  it("releases expired pending-payment reservations", async () => {
    const expiredOrder = {
      id: "order-expired",
      lines: [{ productVariantId: "variant-primary", quantity: 1 }],
      reservationExpiresAt: new Date("2026-08-16T00:00:00.000Z"),
      status: OrderStatus.PENDING_PAYMENT,
    };
    const orderRepository = {
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([expiredOrder]),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const manager = {
      getRepository: vi.fn(() => orderRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const reservationService = { releaseForOrder: vi.fn() };
    const service = new OrdersService(
      dataSource as never,
      reservationService as never,
      {
        releaseEnrollmentsForOrder: vi.fn(),
        reserveEnrollmentWithManager: vi.fn(),
      } as never,
      { recordWithManager: vi.fn() } as never,
      { resolveDiscount: vi.fn() } as never,
    );

    await expect(
      service.releaseExpiredReservations(new Date("2026-08-16T00:30:00.000Z")),
    ).resolves.toBe(1);
    expect(reservationService.releaseForOrder).toHaveBeenCalledWith(
      manager,
      expiredOrder,
    );
    expect(orderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        reservationExpiresAt: null,
        status: OrderStatus.PAYMENT_FAILED,
      }),
    );
  });

  it("returns an order only when the customer phone matches", async () => {
    const orderRepository = {
      findOne: vi.fn().mockResolvedValue({
        contactPhone: "0900000000",
        lines: [],
        orderNumber: "DV-TRACK01",
      }),
    };
    const dataSource = {
      getRepository: vi.fn(() => orderRepository),
    };
    const service = new OrdersService(
      dataSource as never,
      {} as never,
      {} as never,
      { recordWithManager: vi.fn() } as never,
      { resolveDiscount: vi.fn() } as never,
    );

    await expect(
      service.findOrderForContact("DV-TRACK01", "0900000000"),
    ).resolves.toEqual(
      expect.objectContaining({
        orderNumber: "DV-TRACK01",
      }),
    );
    await expect(
      service.findOrderForContact("DV-TRACK01", "0911111111"),
    ).rejects.toThrow("Order was not found");
  });

  it("moves a paid order to packing and records the operations audit", async () => {
    const order = {
      id: "order-1",
      lines: [],
      status: OrderStatus.PAID,
    };
    const orderRepository = {
      createQueryBuilder: vi.fn(() => ({
        getOne: vi.fn().mockResolvedValue(order),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(async (value) => value),
    };
    const manager = {
      getRepository: vi.fn(() => orderRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const audit = { recordWithManager: vi.fn() };
    const service = new OrdersService(
      dataSource as never,
      {} as never,
      {} as never,
      audit as never,
      {} as never,
    );

    await expect(
      service.transitionOrder({
        actorId: "operator-1",
        nextStatus: OrderStatus.PACKING,
        orderId: "order-1",
      }),
    ).resolves.toEqual(
      expect.objectContaining({ status: OrderStatus.PACKING }),
    );

    expect(audit.recordWithManager).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({
        action: "order.status_transition",
        actorId: "operator-1",
        nextState: { status: OrderStatus.PACKING },
        previousState: { status: OrderStatus.PAID },
      }),
    );
  });

  it("releases a pending order reservation when operations cancels it", async () => {
    const order = {
      id: "order-1",
      lines: [],
      paymentMethod: OrderPaymentMethod.COD,
      status: OrderStatus.PENDING_PAYMENT,
    };
    const orderRepository = {
      createQueryBuilder: vi.fn(() => ({
        getOne: vi.fn().mockResolvedValue(order),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(async (value) => value),
    };
    const manager = {
      getRepository: vi.fn(() => orderRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const reservations = {
      releaseForOrder: vi.fn(),
      restockForOrder: vi.fn(),
    };
    const courses = { releaseEnrollmentsForOrder: vi.fn() };
    const service = new OrdersService(
      dataSource as never,
      reservations as never,
      courses as never,
      { recordWithManager: vi.fn() } as never,
      {} as never,
    );

    await service.transitionOrder({
      nextStatus: OrderStatus.CANCELLED,
      orderId: "order-1",
    });

    expect(reservations.releaseForOrder).toHaveBeenCalledWith(manager, order);
    expect(reservations.restockForOrder).not.toHaveBeenCalled();
    expect(courses.releaseEnrollmentsForOrder).toHaveBeenCalledWith(
      manager,
      "order-1",
    );
  });

  it("rejects cancellation while a PayOS payment link can still capture funds", async () => {
    const order = {
      id: "order-1",
      lines: [],
      paymentMethod: OrderPaymentMethod.PAYOS,
      status: OrderStatus.PENDING_PAYMENT,
    };
    const orderRepository = {
      createQueryBuilder: vi.fn(() => ({
        getOne: vi.fn().mockResolvedValue(order),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const manager = {
      getRepository: vi.fn(() => orderRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const reservations = { releaseForOrder: vi.fn() };
    const service = new OrdersService(
      dataSource as never,
      reservations as never,
      { releaseEnrollmentsForOrder: vi.fn() } as never,
      { recordWithManager: vi.fn() } as never,
      {} as never,
    );

    await expect(
      service.transitionOrder({
        nextStatus: OrderStatus.CANCELLED,
        orderId: "order-1",
      }),
    ).rejects.toThrow("PayOS orders must be cancelled through the payment workflow");

    expect(reservations.releaseForOrder).not.toHaveBeenCalled();
    expect(orderRepository.save).not.toHaveBeenCalled();
  });

  it("restocks a refunded order after operations confirms the refund", async () => {
    const order = {
      id: "order-1",
      lines: [],
      status: OrderStatus.REFUND_REQUESTED,
    };
    const orderRepository = {
      createQueryBuilder: vi.fn(() => ({
        getOne: vi.fn().mockResolvedValue(order),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(async (value) => value),
    };
    const manager = {
      getRepository: vi.fn(() => orderRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const reservations = {
      releaseForOrder: vi.fn(),
      restockForOrder: vi.fn(),
    };
    const courses = { releaseEnrollmentsForOrder: vi.fn() };
    const service = new OrdersService(
      dataSource as never,
      reservations as never,
      courses as never,
      { recordWithManager: vi.fn() } as never,
      {} as never,
    );

    await service.transitionOrder({
      nextStatus: OrderStatus.REFUNDED,
      orderId: "order-1",
    });

    expect(reservations.restockForOrder).toHaveBeenCalledWith(manager, order);
    expect(courses.releaseEnrollmentsForOrder).toHaveBeenCalledWith(
      manager,
      "order-1",
    );
  });

  it("rejects PayOS refund completion before a payment refund workflow verifies it", async () => {
    const order = {
      id: "order-1",
      lines: [],
      paymentMethod: OrderPaymentMethod.PAYOS,
      status: OrderStatus.REFUND_REQUESTED,
    };
    const orderRepository = {
      createQueryBuilder: vi.fn(() => ({
        getOne: vi.fn().mockResolvedValue(order),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const manager = {
      getRepository: vi.fn(() => orderRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const reservations = { restockForOrder: vi.fn() };
    const service = new OrdersService(
      dataSource as never,
      reservations as never,
      { releaseEnrollmentsForOrder: vi.fn() } as never,
      { recordWithManager: vi.fn() } as never,
      {} as never,
    );

    await expect(
      service.transitionOrder({
        nextStatus: OrderStatus.REFUNDED,
        orderId: "order-1",
      }),
    ).rejects.toThrow("PayOS refunds must be completed through the payment workflow");

    expect(reservations.restockForOrder).not.toHaveBeenCalled();
    expect(orderRepository.save).not.toHaveBeenCalled();
  });

  it("rejects payment status changes from the operations workflow", async () => {
    const order = {
      id: "order-1",
      lines: [],
      status: OrderStatus.PENDING_PAYMENT,
    };
    const orderRepository = {
      createQueryBuilder: vi.fn(() => ({
        getOne: vi.fn().mockResolvedValue(order),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const manager = {
      getRepository: vi.fn(() => orderRepository),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const service = new OrdersService(
      dataSource as never,
      {} as never,
      {} as never,
      { recordWithManager: vi.fn() } as never,
      {} as never,
    );

    await expect(
      service.transitionOrder({
        nextStatus: OrderStatus.PAID,
        orderId: "order-1",
      }),
    ).rejects.toThrow("Payment status changes must use the payment workflow");

    expect(orderRepository.save).not.toHaveBeenCalled();
  });
});
