import { GUARDS_METADATA } from "@nestjs/common/constants";
import { describe, expect, it, vi } from "vitest";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrderPaymentMethod } from "./entities/order.entity";
import { OrdersController } from "./orders.controller";
import { OrderStatus } from "./order-workflow";

describe("OrdersController", () => {
  it("requires a JWT before accepting an order", () => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        OrdersController.prototype.createOrder,
      ),
    ).toEqual([JwtAuthGuard]);
  });

  it("associates an authenticated checkout with the requesting customer", async () => {
    const ordersService = {
      createOrder: vi.fn().mockResolvedValue({
        orderNumber: "DV-12345678",
        paymentMethod: OrderPaymentMethod.COD,
        status: OrderStatus.PENDING_PAYMENT,
      }),
    };
    const controller = new OrdersController(
      ordersService as never,
      {} as never,
    );
    const input = {
      contactName: "Nguyen Van A",
      contactPhone: "0900000000",
      lines: [{ quantity: 1, variantId: "variant-primary-lab" }],
      paymentMethod: OrderPaymentMethod.COD,
    };

    await controller.createOrder(input, {
      user: { sub: "customer-1" },
    } as never);

    expect(ordersService.createOrder).toHaveBeenCalledWith(input, "customer-1");
  });

  it("returns only the authenticated customer's order history", async () => {
    const ordersService = {
      listForCustomer: vi.fn().mockResolvedValue([{ id: "order-1" }]),
    };
    const controller = new OrdersController(
      ordersService as never,
      {} as never,
    );

    await expect(
      controller.listOwnOrders({ user: { sub: "customer-1" } } as never),
    ).resolves.toEqual([{ id: "order-1" }]);
    expect(ordersService.listForCustomer).toHaveBeenCalledWith("customer-1");
  });

  it("resumes a guest PayOS payment only after the order service verifies its phone", async () => {
    const order = {
      id: "order-1",
      paymentMethod: OrderPaymentMethod.PAYOS,
      status: OrderStatus.PENDING_PAYMENT,
    };
    const ordersService = {
      findForPaymentResume: vi.fn().mockResolvedValue(order),
    };
    const paymentsService = {
      resumePayosCheckout: vi.fn().mockResolvedValue({
        checkoutUrl: "https://pay.example/resume",
      }),
    };
    const controller = new OrdersController(
      ordersService as never,
      paymentsService as never,
    );

    await expect(
      controller.resumePayosPayment(
        "DV-12345678",
        { phone: "0900000000" },
      ),
    ).resolves.toEqual({ checkoutUrl: "https://pay.example/resume" });

    expect(ordersService.findForPaymentResume).toHaveBeenCalledWith(
      "DV-12345678",
      "0900000000",
      undefined,
    );
    expect(paymentsService.resumePayosCheckout).toHaveBeenCalledWith(order);
  });

  it("lets an authenticated order owner resume without sending their phone", async () => {
    const ordersService = {
      findForPaymentResume: vi.fn().mockResolvedValue({ id: "order-1" }),
    };
    const paymentsService = {
      resumePayosCheckout: vi.fn().mockResolvedValue({
        checkoutUrl: "https://pay.example/resume",
      }),
    };
    const controller = new OrdersController(
      ordersService as never,
      paymentsService as never,
    );

    await controller.resumePayosPayment(
      "DV-12345678",
      {},
      { user: { sub: "customer-1" } } as never,
    );

    expect(ordersService.findForPaymentResume).toHaveBeenCalledWith(
      "DV-12345678",
      undefined,
      "customer-1",
    );
  });
});
