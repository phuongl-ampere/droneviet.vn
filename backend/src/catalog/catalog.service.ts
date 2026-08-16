import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PurchaseMode, ProductVariant } from "./entities/product-variant.entity";
import { Product, ProductStatus } from "./entities/product.entity";

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
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async listPublic(): Promise<PublicProductCard[]> {
    const products = await this.productRepository.find({
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
}
