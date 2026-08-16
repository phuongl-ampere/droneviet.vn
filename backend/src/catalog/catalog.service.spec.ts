import { describe, expect, it, vi } from "vitest";
import {
  Product,
  ProductKind,
  ProductStatus,
} from "./entities/product.entity";
import {
  ProductVariant,
  PurchaseMode,
} from "./entities/product-variant.entity";
import { CatalogService } from "./catalog.service";

describe("CatalogService", () => {
  it("returns published product cards using the lowest active public variant price", async () => {
    const productRepository = {
      find: vi.fn().mockResolvedValue([
        {
          id: "product-primary-lab",
          slug: "dv-primary-lab",
          name: "DV Primary Lab",
          summary: "Drone STEM cho lớp học tiểu học.",
          kind: ProductKind.DRONE,
          status: ProductStatus.PUBLISHED,
          coverImageUrl: "/products/primary-lab.webp",
          variants: [
            {
              id: "variant-standard",
              sku: "DV-PL-STD",
              title: "Standard",
              priceVnd: 9_500_000,
              purchaseMode: PurchaseMode.CHECKOUT,
              isActive: true,
            },
            {
              id: "variant-lab",
              sku: "DV-PL-LAB",
              title: "School Lab",
              priceVnd: 18_000_000,
              purchaseMode: PurchaseMode.QUOTE_ONLY,
              isActive: true,
            },
            {
              id: "variant-legacy",
              sku: "DV-PL-OLD",
              title: "Legacy",
              priceVnd: 8_000_000,
              purchaseMode: PurchaseMode.CHECKOUT,
              isActive: false,
            },
          ] as ProductVariant[],
        } as Product,
      ]),
    };

    const service = new CatalogService(productRepository as never);

    await expect(service.listPublic()).resolves.toEqual([
      {
        slug: "dv-primary-lab",
        name: "DV Primary Lab",
        summary: "Drone STEM cho lớp học tiểu học.",
        kind: ProductKind.DRONE,
        coverImageUrl: "/products/primary-lab.webp",
        startingPriceVnd: 9_500_000,
        purchaseMode: PurchaseMode.CHECKOUT,
      },
    ]);
  });
});
