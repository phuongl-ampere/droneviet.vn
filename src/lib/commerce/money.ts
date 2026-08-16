export type MoneyVnd = number;

export interface PriceBreakdownInput {
  lineTotalsVnd: MoneyVnd[];
  discountVnd: MoneyVnd;
  shippingVnd: MoneyVnd;
}

export interface PriceBreakdown {
  subtotalVnd: MoneyVnd;
  discountVnd: MoneyVnd;
  shippingVnd: MoneyVnd;
  totalVnd: MoneyVnd;
}

export interface ProductVariantSnapshotInput {
  variantId: string;
  sku: string;
  title: string;
  unitPriceVnd: MoneyVnd;
  quantity: number;
}

export interface ProductVariantSnapshot extends ProductVariantSnapshotInput {
  lineTotalVnd: MoneyVnd;
}

function assertVnd(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer VND amount`);
  }
}

export function calculatePriceBreakdown({
  lineTotalsVnd,
  discountVnd,
  shippingVnd,
}: PriceBreakdownInput): PriceBreakdown {
  const subtotalVnd = lineTotalsVnd.reduce((total, lineTotalVnd) => {
    assertVnd(lineTotalVnd, "Line total");
    return total + lineTotalVnd;
  }, 0);

  assertVnd(discountVnd, "Discount");
  assertVnd(shippingVnd, "Shipping");

  if (discountVnd > subtotalVnd) {
    throw new Error("Discount cannot exceed the subtotal");
  }

  return {
    subtotalVnd,
    discountVnd,
    shippingVnd,
    totalVnd: subtotalVnd - discountVnd + shippingVnd,
  };
}

export function createProductVariantSnapshot({
  variantId,
  sku,
  title,
  unitPriceVnd,
  quantity,
}: ProductVariantSnapshotInput): ProductVariantSnapshot {
  assertVnd(unitPriceVnd, "Unit price");

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer");
  }

  return {
    variantId,
    sku,
    title,
    unitPriceVnd,
    quantity,
    lineTotalVnd: unitPriceVnd * quantity,
  };
}
