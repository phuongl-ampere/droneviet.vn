import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { In, Repository } from "typeorm";
import {
  ProductVariant,
  PurchaseMode,
} from "../catalog/entities/product-variant.entity";
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
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderLine)
    private readonly orderLineRepository: Repository<OrderLine>,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    if (input.lines.length === 0) {
      throw new BadRequestException("Order must include at least one line");
    }

    const variantIds = input.lines.map((line) => line.variantId);
    const variants = await this.variantRepository.find({
      where: { id: In(variantIds) },
      relations: { product: true },
    });
    const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
    const calculatedLines = input.lines.map((line) => {
      const variant = variantsById.get(line.variantId);

      if (!variant || !variant.isActive) {
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

      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        throw new BadRequestException("Quantity must be a positive integer");
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
    const totalVnd = calculatedLines.reduce(
      (total, line) => total + line.subtotalVnd,
      0,
    );
    const order = await this.orderRepository.save(
      this.orderRepository.create({
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

    await this.orderLineRepository.save(
      calculatedLines.map((line) =>
        this.orderLineRepository.create({
          ...line,
          orderId: order.id,
        }),
      ),
    );

    return order;
  }
}
