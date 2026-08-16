export interface CartLine {
  priceVnd: number;
  quantity: number;
  slug: string;
  title: string;
}

export function addCartLine(
  lines: CartLine[],
  nextLine: CartLine,
): CartLine[] {
  const existing = lines.find((line) => line.slug === nextLine.slug);

  if (!existing) {
    return [...lines, nextLine];
  }

  return lines.map((line) =>
    line.slug === nextLine.slug
      ? { ...line, quantity: line.quantity + nextLine.quantity }
      : line,
  );
}

export function removeCartLine(lines: CartLine[], slug: string): CartLine[] {
  return lines.filter((line) => line.slug !== slug);
}

export function calculateCartTotal(lines: CartLine[]): number {
  return lines.reduce(
    (total, line) => total + line.priceVnd * line.quantity,
    0,
  );
}
