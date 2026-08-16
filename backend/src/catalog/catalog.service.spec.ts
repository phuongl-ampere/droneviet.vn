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

    const service = new CatalogService({
      getRepository: vi.fn(() => productRepository),
    } as never);

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

  it("creates a product with server-owned variant pricing", async () => {
    const productRepository = {
      create: vi.fn((product) => product),
      save: vi.fn(async (product) => ({
        ...product,
        id: "product-code-fleet",
        variants: [{ ...product.variants[0], id: "variant-code-fleet" }],
      })),
    };
    const inventoryRepository = {
      create: vi.fn((inventory) => inventory),
      save: vi.fn(async (inventory) => inventory),
    };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "Product" ? productRepository : inventoryRepository,
      ),
    };
    const service = new CatalogService({
      transaction: vi.fn((callback) => callback(manager)),
    } as never);

    await expect(
      service.createProduct({
        kind: ProductKind.DRONE,
        name: "DV Code Fleet",
        slug: "dv-code-fleet",
        summary: "Fleet drone cho lớp lập trình.",
        variants: [
          {
            priceVnd: 24_900_000,
            purchaseMode: PurchaseMode.CHECKOUT,
            sku: "DV-CF-STD",
            stockOnHand: 0,
            title: "Standard fleet",
          },
        ],
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "product-code-fleet",
        slug: "dv-code-fleet",
        variants: [
          expect.objectContaining({
            priceVnd: 24_900_000,
            sku: "DV-CF-STD",
          }),
        ],
      }),
    );
  });

  it("creates inventory configuration for a checkout variant in the same transaction", async () => {
    const productRepository = {
      create: vi.fn((product) => product),
      save: vi.fn(async (product) => ({
        ...product,
        id: "product-code-fleet",
        variants: [{ ...product.variants[0], id: "variant-code-fleet" }],
      })),
    };
    const inventoryRepository = {
      create: vi.fn((inventory) => inventory),
      save: vi.fn(async (inventory) => inventory),
    };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "Product" ? productRepository : inventoryRepository,
      ),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const service = new CatalogService(dataSource as never);

    await service.createProduct({
      kind: ProductKind.DRONE,
      name: "DV Code Fleet",
      slug: "dv-code-fleet",
      summary: "Fleet drone cho lớp lập trình.",
      variants: [
        {
          priceVnd: 24_900_000,
          purchaseMode: PurchaseMode.CHECKOUT,
          sku: "DV-CF-STD",
          stockOnHand: 6,
          title: "Standard fleet",
        },
      ],
    } as never);

    expect(inventoryRepository.create).toHaveBeenCalledWith({
      onHand: 6,
      productVariantId: "variant-code-fleet",
      reserved: 0,
    });
    expect(dataSource.transaction).toHaveBeenCalledOnce();
  });
});
