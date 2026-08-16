import { describe, expect, it, vi } from "vitest";
import { OrderPaymentMethod } from "./entities/order.entity";
import { OrdersController } from "./orders.controller";
import { OrderStatus } from "./order-workflow";

describe("OrdersController", () => {
  it("forwards a guest checkout request to the order service", async () => {
    const ordersService = {
      createOrder: vi.fn().mockResolvedValue({
        orderNumber: "DV-12345678",
        status: OrderStatus.PENDING_PAYMENT,
      }),
    };
    const controller = new OrdersController(ordersService as never);

    await expect(
      controller.createOrder({
        contactName: "Nguyen Van A",
        contactPhone: "0900000000",
        lines: [{ quantity: 1, variantId: "variant-primary-lab" }],
        paymentMethod: OrderPaymentMethod.PAYOS,
      }),
    ).resolves.toEqual({
      orderNumber: "DV-12345678",
      status: OrderStatus.PENDING_PAYMENT,
    });
  });
});
