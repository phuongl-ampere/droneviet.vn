import type { CartLine } from "./cart";

export type CheckoutPaymentMethod = "bank_transfer" | "cod" | "payos";

export interface SubmitCheckoutInput {
  contactEmail?: string;
  contactName: string;
  contactPhone: string;
  lines: CartLine[];
  paymentMethod: CheckoutPaymentMethod;
  promotionCode?: string;
  shippingAddress?: string;
}

export async function submitCheckout(input: SubmitCheckoutInput) {
  const apiUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");

  if (!apiUrl) {
    throw new Error("Commerce API is not configured");
  }

  const lines = input.lines.map((line) => {
    if (!line.variantId) {
      throw new Error(`${line.title} cannot be checked out until it has a server variant`);
    }

    return {
      courseSessionId: line.courseSessionId,
      quantity: line.quantity,
      variantId: line.variantId,
    };
  });
  const response = await fetch(`${apiUrl}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contactEmail: input.contactEmail,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      lines,
      paymentMethod: input.paymentMethod,
      promotionCode: input.promotionCode,
      shippingAddress: input.shippingAddress,
    }),
  });
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("Checkout could not be created");
  }

  return payload;
}
