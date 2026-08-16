import { describe, expect, it, vi } from "vitest";
import { PurchaseMode } from "../catalog/entities/product-variant.entity";
import { OrderStatus } from "./order-workflow";
import { OrdersService } from "./orders.service";

describe("OrdersService", () => {
  it("recalculates direct-purchase SKU prices and snapshots order lines", async () => {
    const variantRepository = {
      find: vi.fn().mockResolvedValue([
        {
          id: "variant-primary-lab",
          isActive: true,
          priceVnd: 9_500_000,
          product: { name: "DV Primary Lab" },
          purchaseMode: PurchaseMode.CHECKOUT,
          sku: "DV-PL-STD",
          title: "Standard kit",
        },
      ]),
    };
    const orderRepository = {
      create: vi.fn((order) => order),
      save: vi.fn(async (order) => ({ ...order, id: "order-1" })),
    };
    const orderLineRepository = {
      create: vi.fn((line) => line),
      save: vi.fn(async (lines) => lines),
    };
    const service = new OrdersService(
      variantRepository as never,
      orderRepository as never,
      orderLineRepository as never,
    );

    await expect(
      service.createOrder({
        contactName: "Nguyen Van A",
        contactPhone: "0900000000",
        lines: [{ quantity: 2, variantId: "variant-primary-lab" }],
        paymentMethod: "payos",
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
  });
});
