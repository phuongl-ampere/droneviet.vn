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
          {
            productVariantId: "variant-primary",
            quantity: 3,
            reservesInventory: true,
          },
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

  it("commits reserved stock when an order is paid", async () => {
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

    await service.commitForOrder(
      manager as never,
      {
        lines: [
          {
            productVariantId: "variant-primary",
            quantity: 2,
            reservesInventory: true,
          },
        ],
      } as never,
    );

    expect(inventoryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        onHand: 22,
        reserved: 0,
      }),
    );
  });

  it("restocks committed inventory after an operations cancellation", async () => {
    const inventoryRepository = {
      createQueryBuilder: vi.fn(() => ({
        getMany: vi.fn().mockResolvedValue([
          {
            onHand: 22,
            productVariantId: "variant-primary",
            reserved: 0,
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

    await service.restockForOrder(
      manager as never,
      {
        lines: [
          {
            productVariantId: "variant-primary",
            quantity: 2,
            reservesInventory: true,
          },
        ],
      } as never,
    );

    expect(inventoryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ onHand: 24 }),
    );
  });

  it("does not commit inventory for a preorder line that was never reserved", async () => {
    const getMany = vi.fn().mockResolvedValue([]);
    const inventoryRepository = {
      createQueryBuilder: vi.fn(() => ({
        getMany,
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const manager = {
      getRepository: vi.fn(() => inventoryRepository),
    };
    const service = new InventoryReservationService();

    await service.commitForOrder(
      manager as never,
      {
        lines: [
          {
            productVariantId: "variant-preorder",
            quantity: 1,
            reservesInventory: false,
          },
        ],
      } as never,
    );

    expect(getMany).not.toHaveBeenCalled();
    expect(inventoryRepository.save).not.toHaveBeenCalled();
  });
});
