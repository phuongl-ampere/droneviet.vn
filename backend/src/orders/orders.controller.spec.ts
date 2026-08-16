import { describe, expect, it, vi } from "vitest";
import { OrderPaymentMethod } from "./entities/order.entity";
import { OrdersController } from "./orders.controller";
import { OrderStatus } from "./order-workflow";

describe("OrdersController", () => {
  it("forwards a guest checkout request to the order service", async () => {
    const ordersService = {
      createOrder: vi.fn().mockResolvedValue({
        orderNumber: "DV-12345678",
        paymentMethod: OrderPaymentMethod.PAYOS,
        status: OrderStatus.PENDING_PAYMENT,
      }),
    };
    const paymentsService = {
      createPayosCheckout: vi.fn().mockResolvedValue({
        checkoutUrl: "https://pay.example/checkout",
      }),
    };
    const controller = new OrdersController(
      ordersService as never,
      paymentsService as never,
    );

    await expect(
      controller.createOrder({
        contactName: "Nguyen Van A",
        contactPhone: "0900000000",
        lines: [{ quantity: 1, variantId: "variant-primary-lab" }],
        paymentMethod: OrderPaymentMethod.PAYOS,
      }),
    ).resolves.toEqual({
      checkoutUrl: "https://pay.example/checkout",
      order: {
        orderNumber: "DV-12345678",
        paymentMethod: OrderPaymentMethod.PAYOS,
        status: OrderStatus.PENDING_PAYMENT,
      },
    });
  });
});
