import { describe, expect, it } from "vitest";
import {
  filterStoreProducts,
  getStoreProducts,
  storeProducts,
} from "./storefront-catalog";

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

  it("filters devices by their intended learning stage", () => {
    expect(
      filterStoreProducts(storeProducts, {
        learningStage: "high-school",
      }).map((product) => product.slug),
    ).toEqual(["dv-ai-vision", "dv-instructor-kit"]);
  });

  it("matches a product name or summary from a storefront search query", () => {
    expect(
      filterStoreProducts(storeProducts, { query: "telemetry" }).map(
        (product) => product.slug,
      ),
    ).toEqual(["dv-ai-vision", "dv-research-platform"]);
  });

  it("uses the requested dictionary for storefront product copy", () => {
    const product = getStoreProducts("en").find(
      (item) => item.slug === "dv-ai-vision",
    );

    expect(product?.summary).toBe(
      "Camera, telemetry, and a dataset workflow for AI and IoT projects.",
    );
    expect(product?.badge).toBe("Pre-order");
  });
});
