import { BadRequestException, Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { Order } from "../orders/entities/order.entity";
import { PurchaseMode } from "../catalog/entities/product-variant.entity";
import { InventoryItem } from "./entities/inventory-item.entity";

@Injectable()
export class InventoryReservationService {
  async releaseForOrder(
    manager: EntityManager,
    order: Pick<Order, "lines">,
  ): Promise<void> {
    const quantities = new Map<string, number>();

    for (const line of order.lines) {
      quantities.set(
        line.productVariantId,
        (quantities.get(line.productVariantId) ?? 0) + line.quantity,
      );
    }

    if (quantities.size === 0) {
      return;
    }

    const variantIds = [...quantities.keys()];
    const inventoryRepository = manager.getRepository(InventoryItem);
    const inventory = await inventoryRepository
      .createQueryBuilder("inventory")
      .where("inventory.productVariantId IN (:...variantIds)", { variantIds })
      .setLock("pessimistic_write")
      .getMany();

    for (const item of inventory) {
      item.reserved = Math.max(
        0,
        item.reserved - (quantities.get(item.productVariantId) ?? 0),
      );
      await inventoryRepository.save(item);
    }
  }

  async reserve(
    manager: EntityManager,
    requirements: Array<{
      productVariantId: string;
      purchaseMode: PurchaseMode;
      quantity: number;
    }>,
  ): Promise<void> {
    const quantities = new Map<string, number>();

    for (const requirement of requirements) {
      if (requirement.purchaseMode === "preorder") {
        continue;
      }

      quantities.set(
        requirement.productVariantId,
        (quantities.get(requirement.productVariantId) ?? 0) +
          requirement.quantity,
      );
    }

    if (quantities.size === 0) {
      return;
    }

    const variantIds = [...quantities.keys()];
    const inventoryRepository = manager.getRepository(InventoryItem);
    const inventory = await inventoryRepository
      .createQueryBuilder("inventory")
      .where("inventory.productVariantId IN (:...variantIds)", { variantIds })
      .setLock("pessimistic_write")
      .getMany();
    const inventoryByVariant = new Map(
      inventory.map((item) => [item.productVariantId, item]),
    );

    for (const [productVariantId, quantity] of quantities) {
      const item = inventoryByVariant.get(productVariantId);

      if (!item || item.onHand - item.reserved < quantity) {
        throw new BadRequestException(
          `Variant ${productVariantId} no longer has enough inventory`,
        );
      }

      item.reserved += quantity;
      await inventoryRepository.save(item);
    }
  }
}
