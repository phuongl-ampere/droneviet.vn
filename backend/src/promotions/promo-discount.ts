export interface PromotionRule {
  maxDiscountVnd?: number;
  minimumOrderVnd?: number;
  type: "fixed" | "percentage";
  value: number;
}

export function calculatePromotionDiscount(
  rule: PromotionRule,
  subtotalVnd: number,
): number {
  if (subtotalVnd < (rule.minimumOrderVnd ?? 0)) {
    return 0;
  }

  const rawDiscount =
    rule.type === "percentage"
      ? Math.floor((subtotalVnd * rule.value) / 100)
      : rule.value;
  const cappedDiscount = Math.min(
    rawDiscount,
    rule.maxDiscountVnd ?? rawDiscount,
  );

  return Math.max(0, Math.min(subtotalVnd, cappedDiscount));
}
