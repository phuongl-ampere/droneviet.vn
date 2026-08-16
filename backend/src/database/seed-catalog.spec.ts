import { describe, expect, it, vi } from "vitest";
import { commerceSeedProducts, seedCatalogProducts } from "./seed-catalog";

describe("seedCatalogProducts", () => {
  it("upserts stable storefront variants and inventory", async () => {
    const productRepository = { upsert: vi.fn() };
    const variantRepository = { upsert: vi.fn() };
    const inventoryRepository = { upsert: vi.fn() };
    const courseRepository = { upsert: vi.fn() };
    const sessionRepository = { upsert: vi.fn() };

    await seedCatalogProducts({
      getRepository: vi.fn((entity) => {
        if (entity.name === "Product") return productRepository;
        if (entity.name === "ProductVariant") return variantRepository;
        if (entity.name === "InventoryItem") return inventoryRepository;
        if (entity.name === "Course") return courseRepository;
        return sessionRepository;
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
    expect(
      inventoryRepository.upsert.mock.calls[0]?.[0]?.[0],
    ).not.toHaveProperty("reserved");
    expect(commerceSeedProducts).toHaveLength(8);
    expect(courseRepository.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "drone-nhap-mon-cap-1",
        }),
      ]),
      ["id"],
    );
    expect(sessionRepository.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "99999999-9999-4999-8999-999999999999",
          reservedSeats: 0,
        }),
      ]),
      ["id"],
    );
  });
});
