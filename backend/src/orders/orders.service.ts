import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { DataSource } from "typeorm";
import {
  ProductVariant,
  PurchaseMode,
} from "../catalog/entities/product-variant.entity";
import { ProductKind, ProductStatus } from "../catalog/entities/product.entity";
import { CoursesService } from "../courses/courses.service";
import { AuditService } from "../audit/audit.service";
import { InventoryReservationService } from "../inventory/inventory-reservation.service";
import { Order, OrderPaymentMethod } from "./entities/order.entity";
import { OrderLine } from "./entities/order-line.entity";
import { OrderStatus } from "./order-workflow";

export interface CreateOrderInput {
  contactEmail?: string;
  contactName: string;
  contactPhone: string;
  lines: Array<{
    courseSessionId?: string;
    quantity: number;
    variantId: string;
  }>;
  paymentMethod: OrderPaymentMethod;
  shippingAddress?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly reservations: InventoryReservationService,
    private readonly courses: CoursesService,
    private readonly audit: AuditService,
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
      for (const line of input.lines) {
        if (!Number.isInteger(line.quantity) || line.quantity < 1) {
          throw new BadRequestException("Quantity must be a positive integer");
        }
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
          courseSessionId: line.courseSessionId ?? null,
          productVariantId: variant.id,
          quantity: line.quantity,
          sku: variant.sku,
          subtotalVnd: variant.priceVnd * line.quantity,
          title: `${variant.product.name} - ${variant.title}`,
          unitPriceVnd: variant.priceVnd,
        };
      });

      await this.reservations.reserve(
        manager,
        calculatedLines.map((line) => ({
          productVariantId: line.productVariantId,
          purchaseMode: variantsById.get(line.productVariantId)!.purchaseMode,
          quantity: line.quantity,
          requiresInventory:
            variantsById.get(line.productVariantId)!.product.kind !==
            ProductKind.COURSE,
        })),
      );

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
          reservationExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
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

      await this.audit.recordWithManager(manager, {
        action: "order.created",
        aggregateId: order.id,
        aggregateType: "order",
        nextState: { status: order.status, totalVnd: order.totalVnd },
      });

      for (const line of calculatedLines) {
        const variant = variantsById.get(line.productVariantId)!;
        if (variant.product.kind !== ProductKind.COURSE) {
          continue;
        }

        if (!line.courseSessionId) {
          throw new BadRequestException(
            `Course variant ${line.productVariantId} requires a session`,
          );
        }

        await this.courses.reserveEnrollmentWithManager(manager, {
          contactEmail: input.contactEmail,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          orderId: order.id,
          quantity: line.quantity,
          sessionId: line.courseSessionId,
        });
      }

      return order;
    });
  }

  async releaseExpiredReservations(now = new Date()): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const expiredOrders = await orderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.lines", "line")
        .where("order.status = :status", {
          status: OrderStatus.PENDING_PAYMENT,
        })
        .andWhere("order.reservationExpiresAt <= :now", { now })
        .setLock("pessimistic_write")
        .getMany();

      for (const order of expiredOrders) {
        await this.reservations.releaseForOrder(manager, order);
        await this.courses.releaseEnrollmentsForOrder(manager, order.id);
        order.reservationExpiresAt = null;
        order.status = OrderStatus.PAYMENT_FAILED;
        await orderRepository.save(order);
        await this.audit.recordWithManager(manager, {
          action: "order.reservation_expired",
          aggregateId: order.id,
          aggregateType: "order",
          nextState: { status: order.status },
          previousState: { status: OrderStatus.PENDING_PAYMENT },
        });
      }

      return expiredOrders.length;
    });
  }

  async findOrderForContact(
    orderNumber: string,
    contactPhone: string,
  ): Promise<Order> {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { orderNumber },
      relations: { lines: true },
    });

    if (!order || order.contactPhone !== contactPhone.trim()) {
      throw new NotFoundException("Order was not found");
    }

    return order;
  }
}
