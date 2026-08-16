import { describe, expect, it } from "vitest";
import {
  addCartLine,
  calculateCartTotal,
  removeCartLine,
  type CartLine,
} from "./cart";

const primaryLab: CartLine = {
  priceVnd: 9_500_000,
  quantity: 1,
  slug: "dv-primary-lab",
  title: "DV Primary Lab",
};

describe("cart helpers", () => {
  it("merges the same product into one cart line", () => {
    expect(addCartLine([primaryLab], primaryLab)).toEqual([
      { ...primaryLab, quantity: 2 },
    ]);
  });

  it("calculates total from immutable cart line prices", () => {
    expect(
      calculateCartTotal([
        { ...primaryLab, quantity: 2 },
        {
          priceVnd: 1_200_000,
          quantity: 1,
          slug: "dv-safety-kit",
          title: "DV Safety Kit",
        },
      ]),
    ).toBe(20_200_000);
  });

  it("removes a selected cart line", () => {
    expect(removeCartLine([primaryLab], primaryLab.slug)).toEqual([]);
  });
});
