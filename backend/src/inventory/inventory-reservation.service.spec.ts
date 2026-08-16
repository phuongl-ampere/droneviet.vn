import { describe, expect, it, vi } from "vitest";
import { InventoryReservationService } from "./inventory-reservation.service";

describe("InventoryReservationService", () => {
  it("releases reserved stock for a cancelled or expired order without going negative", async () => {
    const inventoryRepository = {
      createQueryBuilder: vi.fn(() => ({
        getMany: vi.fn().mockResolvedValue([
          {
            onHand: 24,
            productVariantId: "variant-primary",
            reserved: 2,
          },
        ]),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const manager = {
      getRepository: vi.fn(() => inventoryRepository),
    };
    const service = new InventoryReservationService();

    await service.releaseForOrder(
      manager as never,
      {
        lines: [
          { productVariantId: "variant-primary", quantity: 3 },
        ],
      } as never,
    );

    expect(inventoryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        productVariantId: "variant-primary",
        reserved: 0,
      }),
    );
  });
});
