"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  addCartLine,
  calculateCartTotal,
  removeCartLine,
  type CartLine,
} from "@/lib/commerce/cart";

interface CartContextValue {
  addLine: (line: CartLine) => void;
  clearCart: () => void;
  lineCount: number;
  lines: CartLine[];
  removeLine: (slug: string) => void;
  totalVnd: number;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
  initialLines?: CartLine[];
}

export function CartProvider({ children, initialLines }: CartProviderProps) {
  const [lines, setLines] = useState<CartLine[]>(initialLines ?? []);

  const value = useMemo<CartContextValue>(
    () => ({
      addLine: (line) => setLines((current) => addCartLine(current, line)),
      clearCart: () => setLines([]),
      lineCount: lines.reduce((total, line) => total + line.quantity, 0),
      lines,
      removeLine: (slug) =>
        setLines((current) => removeCartLine(current, slug)),
      totalVnd: calculateCartTotal(lines),
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
