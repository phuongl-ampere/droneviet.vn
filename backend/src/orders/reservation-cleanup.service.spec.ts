import { describe, expect, it, vi } from "vitest";
import { ReservationCleanupService } from "./reservation-cleanup.service";

describe("ReservationCleanupService", () => {
  it("runs expired reservation cleanup through OrdersService", async () => {
    const orders = {
      releaseExpiredReservations: vi.fn().mockResolvedValue(2),
    };
    const service = new ReservationCleanupService(orders as never);

    await expect(service.runOnce()).resolves.toBe(2);
    expect(orders.releaseExpiredReservations).toHaveBeenCalledOnce();
  });
});
