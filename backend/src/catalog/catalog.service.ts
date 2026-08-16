import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PurchaseMode, ProductVariant } from "./entities/product-variant.entity";
import { Product, ProductKind, ProductStatus } from "./entities/product.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { InventoryItem } from "../inventory/entities/inventory-item.entity";

export interface PublicProductCard {
  slug: string;
  name: string;
  summary: string;
  kind: Product["kind"];
  coverImageUrl: string | null;
  startingPriceVnd: number;
  purchaseMode: PurchaseMode;
}

function purchaseModeRank(mode: PurchaseMode): number {
  switch (mode) {
    case PurchaseMode.CHECKOUT:
      return 0;
    case PurchaseMode.PREORDER:
      return 1;
    case PurchaseMode.QUOTE_ONLY:
      return 2;
  }
}

function isLowerPrice(
  candidate: ProductVariant,
  current: ProductVariant,
): boolean {
  if (purchaseModeRank(candidate.purchaseMode) !== purchaseModeRank(current.purchaseMode)) {
    return purchaseModeRank(candidate.purchaseMode) < purchaseModeRank(current.purchaseMode);
  }

  return candidate.priceVnd < current.priceVnd;
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async listPublic(): Promise<PublicProductCard[]> {
    const products = await this.dataSource.getRepository(Product).find({
      where: { status: ProductStatus.PUBLISHED },
      relations: { variants: true },
      order: { createdAt: "DESC" },
    });

    return products.flatMap((product) => {
      const activeVariants = product.variants.filter((variant) => variant.isActive);

      if (activeVariants.length === 0) {
        return [];
      }

      const startingVariant = activeVariants.reduce((current, candidate) =>
        isLowerPrice(candidate, current) ? candidate : current,
      );

      return [
        {
          slug: product.slug,
          name: product.name,
          summary: product.summary,
          kind: product.kind,
          coverImageUrl: product.coverImageUrl,
          startingPriceVnd: startingVariant.priceVnd,
          purchaseMode: startingVariant.purchaseMode,
        },
      ];
    });
  }

  async createProduct(input: CreateProductDto): Promise<Product> {
    if (input.variants.some((variant) => !Number.isInteger(variant.priceVnd))) {
      throw new BadRequestException("Variant prices must be integer VND amounts");
    }

    return this.dataSource.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);
      const product = await productRepository.save(
        productRepository.create({
        coverImageUrl: input.coverImageUrl ?? null,
        kind: input.kind,
        name: input.name,
        slug: input.slug,
        status: ProductStatus.DRAFT,
        summary: input.summary,
        variants: input.variants.map((variant) => ({
          isActive: true,
          priceVnd: variant.priceVnd,
          purchaseMode: variant.purchaseMode,
          sku: variant.sku,
          title: variant.title,
        })),
        }),
      );

      if (input.kind === ProductKind.COURSE) {
        return product;
      }

      const inventoryRepository = manager.getRepository(InventoryItem);
      await inventoryRepository.save(
        product.variants.map((variant, index) =>
          inventoryRepository.create({
            onHand: input.variants[index].stockOnHand,
            productVariantId: variant.id,
            reserved: 0,
          }),
        ),
      );

      return product;
    });
  }

  async publishProduct(productId: string): Promise<Product> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Product);
      const product = await repository.findOneByOrFail({ id: productId });

      product.status = ProductStatus.PUBLISHED;
      return repository.save(product);
    });
  }
}
