import { describe, expect, it } from "vitest";
import { filterStoreProducts, storeProducts } from "./storefront-catalog";

describe("filterStoreProducts", () => {
  it("returns in-stock devices matching a catalog collection", () => {
    expect(
      filterStoreProducts(storeProducts, {
        availability: "in_stock",
        collection: "stem",
      }).map((product) => product.slug),
    ).toEqual(["dv-primary-lab", "dv-code-fleet"]);
  });

  it("keeps quote-only research products out of a direct-purchase filter", () => {
    expect(
      filterStoreProducts(storeProducts, {
        purchaseMode: "checkout",
      }).every((product) => product.purchaseMode === "checkout"),
    ).toBe(true);
  });

  it("matches a product name or summary from a storefront search query", () => {
    expect(
      filterStoreProducts(storeProducts, { query: "telemetry" }).map(
        (product) => product.slug,
      ),
    ).toEqual(["dv-ai-vision", "dv-research-platform"]);
  });
});
