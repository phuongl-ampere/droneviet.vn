import { describe, expect, it } from "vitest";
import {
  canTransitionOrder,
  OrderStatus,
} from "./order-workflow";

describe("order workflow", () => {
  it("allows the normal paid fulfillment lifecycle", () => {
    expect(
      canTransitionOrder(OrderStatus.PENDING_PAYMENT, OrderStatus.PAID),
    ).toBe(true);
    expect(canTransitionOrder(OrderStatus.PAID, OrderStatus.PACKING)).toBe(
      true,
    );
    expect(canTransitionOrder(OrderStatus.PACKING, OrderStatus.SHIPPED)).toBe(
      true,
    );
    expect(
      canTransitionOrder(OrderStatus.SHIPPED, OrderStatus.DELIVERED),
    ).toBe(true);
  });

  it("does not allow unpaid orders to be shipped", () => {
    expect(
      canTransitionOrder(OrderStatus.PENDING_PAYMENT, OrderStatus.SHIPPED),
    ).toBe(false);
  });

  it("requires a refund workflow instead of cancelling a paid order", () => {
    expect(
      canTransitionOrder(OrderStatus.PAID, OrderStatus.CANCELLED),
    ).toBe(false);
    expect(
      canTransitionOrder(OrderStatus.PACKING, OrderStatus.CANCELLED),
    ).toBe(false);
    expect(
      canTransitionOrder(OrderStatus.PAID, OrderStatus.REFUND_REQUESTED),
    ).toBe(true);
  });
});
