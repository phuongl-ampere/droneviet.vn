export enum OrderStatus {
  CANCELLED = "cancelled",
  DELIVERED = "delivered",
  PACKING = "packing",
  PAID = "paid",
  PAYMENT_FAILED = "payment_failed",
  PENDING_PAYMENT = "pending_payment",
  REFUND_REQUESTED = "refund_requested",
  REFUNDED = "refunded",
  SHIPPED = "shipped",
}

const transitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUND_REQUESTED],
  [OrderStatus.PACKING]: [
    OrderStatus.REFUND_REQUESTED,
    OrderStatus.SHIPPED,
  ],
  [OrderStatus.PAID]: [
    OrderStatus.PACKING,
    OrderStatus.REFUND_REQUESTED,
  ],
  [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PENDING_PAYMENT],
  [OrderStatus.PENDING_PAYMENT]: [
    OrderStatus.CANCELLED,
    OrderStatus.PAID,
    OrderStatus.PAYMENT_FAILED,
  ],
  [OrderStatus.REFUND_REQUESTED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.REFUND_REQUESTED],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return transitions[from].includes(to);
}
