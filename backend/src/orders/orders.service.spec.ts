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
    const service = new OrdersService(
      dataSource as never,
      reservationService as never,
      { reserveEnrollmentWithManager: vi.fn() } as never,
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
});
