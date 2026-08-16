import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { DataSource } from "typeorm";
import {
  ProductVariant,
  PurchaseMode,
} from "../catalog/entities/product-variant.entity";
import { ProductStatus } from "../catalog/entities/product.entity";
import { InventoryItem } from "../inventory/entities/inventory-item.entity";
import { Order, OrderPaymentMethod } from "./entities/order.entity";
import { OrderLine } from "./entities/order-line.entity";
import { OrderStatus } from "./order-workflow";

export interface CreateOrderInput {
  contactEmail?: string;
  contactName: string;
  contactPhone: string;
  lines: Array<{ quantity: number; variantId: string }>;
  paymentMethod: OrderPaymentMethod;
  shippingAddress?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    if (input.lines.length === 0) {
      throw new BadRequestException("Order must include at least one line");
    }

    return this.dataSource.transaction(async (manager) => {
      const variantIds = input.lines.map((line) => line.variantId);
      const variants = await manager
        .getRepository(ProductVariant)
        .createQueryBuilder("variant")
        .leftJoinAndSelect("variant.product", "product")
        .leftJoinAndSelect("variant.inventory", "inventory")
        .where("variant.id IN (:...variantIds)", { variantIds })
        .setLock("pessimistic_write")
        .getMany();
      const variantsById = new Map(
        variants.map((variant) => [variant.id, variant]),
      );
      const quantitiesByVariant = new Map<string, number>();

      for (const line of input.lines) {
        if (!Number.isInteger(line.quantity) || line.quantity < 1) {
          throw new BadRequestException("Quantity must be a positive integer");
        }

        quantitiesByVariant.set(
          line.variantId,
          (quantitiesByVariant.get(line.variantId) ?? 0) + line.quantity,
        );
      }

      const calculatedLines = input.lines.map((line) => {
        const variant = variantsById.get(line.variantId);

        if (
          !variant ||
          !variant.isActive ||
          variant.product.status !== ProductStatus.PUBLISHED
        ) {
          throw new NotFoundException(`Variant ${line.variantId} is unavailable`);
        }

        if (
          variant.purchaseMode !== PurchaseMode.CHECKOUT &&
          variant.purchaseMode !== PurchaseMode.PREORDER
        ) {
          throw new BadRequestException(
            `Variant ${line.variantId} requires a quote instead of checkout`,
          );
        }

        return {
          productVariantId: variant.id,
          quantity: line.quantity,
          sku: variant.sku,
          subtotalVnd: variant.priceVnd * line.quantity,
          title: `${variant.product.name} - ${variant.title}`,
          unitPriceVnd: variant.priceVnd,
        };
      });

      const inventoryRepository = manager.getRepository(InventoryItem);
      for (const [variantId, requestedQuantity] of quantitiesByVariant) {
        const variant = variantsById.get(variantId);

        if (!variant) {
          throw new NotFoundException(`Variant ${variantId} is unavailable`);
        }

        if (variant.purchaseMode === PurchaseMode.PREORDER) {
          continue;
        }

        const inventory = variant.inventory;
        if (!inventory || inventory.onHand - inventory.reserved < requestedQuantity) {
          throw new BadRequestException(
            `Variant ${variantId} no longer has enough inventory`,
          );
        }

        inventory.reserved += requestedQuantity;
        await inventoryRepository.save(inventory);
      }

      const totalVnd = calculatedLines.reduce(
        (total, line) => total + line.subtotalVnd,
        0,
      );
      const orderRepository = manager.getRepository(Order);
      const order = await orderRepository.save(
        orderRepository.create({
          contactEmail: input.contactEmail ?? null,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          orderNumber: `DV-${randomUUID().slice(0, 8).toUpperCase()}`,
          paymentMethod: input.paymentMethod,
          shippingAddress: input.shippingAddress ?? null,
          status: OrderStatus.PENDING_PAYMENT,
          totalVnd,
        }),
      );
      const orderLineRepository = manager.getRepository(OrderLine);

      await orderLineRepository.save(
        calculatedLines.map((line) =>
          orderLineRepository.create({
            ...line,
            orderId: order.id,
          }),
        ),
      );

      return order;
    });
  }
}
