import { describe, expect, it, vi } from "vitest";
import { OrderStatus } from "./order-workflow";
import { AdminOrdersController } from "./admin-orders.controller";

describe("AdminOrdersController", () => {
  it("lists orders for an authorized operations client", async () => {
    const orders = { listForOperations: vi.fn().mockResolvedValue([{ id: "order-1" }]) };
    const controller = new AdminOrdersController(orders as never);

    await expect(controller.listOrders()).resolves.toEqual([{ id: "order-1" }]);
  });

  it("transitions an order with the authenticated actor id", async () => {
    const orders = { transitionOrder: vi.fn().mockResolvedValue({ id: "order-1" }) };
    const controller = new AdminOrdersController(orders as never);

    await expect(
      controller.transitionOrder(
        "order-1",
        { nextStatus: OrderStatus.PACKING },
        { user: { sub: "operator-1" } },
      ),
    ).resolves.toEqual({ id: "order-1" });

    expect(orders.transitionOrder).toHaveBeenCalledWith({
      actorId: "operator-1",
      nextStatus: OrderStatus.PACKING,
      orderId: "order-1",
    });
  });
});
