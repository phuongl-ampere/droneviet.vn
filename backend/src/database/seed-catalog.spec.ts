import { describe, expect, it, vi } from "vitest";
import { commerceSeedProducts, seedCatalogProducts } from "./seed-catalog";

describe("seedCatalogProducts", () => {
  it("upserts stable storefront variants and inventory", async () => {
    const productRepository = { upsert: vi.fn() };
    const variantRepository = { upsert: vi.fn() };
    const inventoryRepository = { upsert: vi.fn() };

    await seedCatalogProducts({
      getRepository: vi.fn((entity) => {
        if (entity.name === "Product") return productRepository;
        if (entity.name === "ProductVariant") return variantRepository;
        return inventoryRepository;
      }),
    } as never);

    expect(productRepository.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          slug: "dv-primary-lab",
        }),
      ]),
      ["id"],
    );
    expect(variantRepository.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "11111111-1111-4111-8111-111111111111",
          priceVnd: 9_500_000,
        }),
      ]),
      ["id"],
    );
    expect(inventoryRepository.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          onHand: 24,
          productVariantId: "11111111-1111-4111-8111-111111111111",
        }),
      ]),
      ["productVariantId"],
    );
    expect(commerceSeedProducts).toHaveLength(8);
  });
});
