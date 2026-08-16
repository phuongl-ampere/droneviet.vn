import { BadRequestException, Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { Order } from "../orders/entities/order.entity";
import { PurchaseMode } from "../catalog/entities/product-variant.entity";
import { InventoryItem } from "./entities/inventory-item.entity";

@Injectable()
export class InventoryReservationService {
  async commitForOrder(
    manager: EntityManager,
    order: Pick<Order, "lines">,
  ): Promise<void> {
    const quantities = this.quantitiesForOrder(order);

    if (quantities.size === 0) {
      return;
    }

    const inventoryRepository = manager.getRepository(InventoryItem);
    const inventory = await this.lockInventory(
      manager,
      [...quantities.keys()],
    );

    for (const item of inventory) {
      const quantity = quantities.get(item.productVariantId) ?? 0;
      item.onHand = Math.max(0, item.onHand - quantity);
      item.reserved = Math.max(0, item.reserved - quantity);
      await inventoryRepository.save(item);
    }
  }

  async releaseForOrder(
    manager: EntityManager,
    order: Pick<Order, "lines">,
  ): Promise<void> {
    const quantities = this.quantitiesForOrder(order);

    if (quantities.size === 0) {
      return;
    }

    const inventoryRepository = manager.getRepository(InventoryItem);
    const inventory = await this.lockInventory(manager, [...quantities.keys()]);

    for (const item of inventory) {
      item.reserved = Math.max(
        0,
        item.reserved - (quantities.get(item.productVariantId) ?? 0),
      );
      await inventoryRepository.save(item);
    }
  }

  async restockForOrder(
    manager: EntityManager,
    order: Pick<Order, "lines">,
  ): Promise<void> {
    const quantities = this.quantitiesForOrder(order);

    if (quantities.size === 0) {
      return;
    }

    const inventoryRepository = manager.getRepository(InventoryItem);
    const inventory = await this.lockInventory(manager, [...quantities.keys()]);

    for (const item of inventory) {
      item.onHand += quantities.get(item.productVariantId) ?? 0;
      await inventoryRepository.save(item);
    }
  }

  async reserve(
    manager: EntityManager,
    requirements: Array<{
      productVariantId: string;
      purchaseMode: PurchaseMode;
      quantity: number;
      requiresInventory: boolean;
    }>,
  ): Promise<void> {
    const quantities = new Map<string, number>();

    for (const requirement of requirements) {
      if (
        requirement.purchaseMode === "preorder" ||
        !requirement.requiresInventory
      ) {
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

    const inventoryRepository = manager.getRepository(InventoryItem);
    const inventory = await this.lockInventory(manager, [...quantities.keys()]);
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

  private async lockInventory(
    manager: EntityManager,
    variantIds: string[],
  ): Promise<InventoryItem[]> {
    return manager
      .getRepository(InventoryItem)
      .createQueryBuilder("inventory")
      .where("inventory.productVariantId IN (:...variantIds)", { variantIds })
      .setLock("pessimistic_write")
      .getMany();
  }

  private quantitiesForOrder(order: Pick<Order, "lines">): Map<string, number> {
    const quantities = new Map<string, number>();

    for (const line of order.lines) {
      if (!line.reservesInventory) {
        continue;
      }

      quantities.set(
        line.productVariantId,
        (quantities.get(line.productVariantId) ?? 0) + line.quantity,
      );
    }

    return quantities;
  }
}
