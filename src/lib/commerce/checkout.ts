import type { CartLine } from "./cart";
import { commerceApiUrl } from "./commerce-api-url";

export type CheckoutPaymentMethod = "bank_transfer" | "cod" | "payos";
export type CheckoutFulfillmentMethod = "delivery" | "showroom_pickup";

export type ShippingEstimate = {
  amountVnd: number | null;
  carrier: string;
  note: string;
  pricingStatus: "manual_quote";
};

export interface SubmitCheckoutInput {
  contactEmail?: string;
  contactName: string;
  contactPhone: string;
  fulfillmentMethod: CheckoutFulfillmentMethod;
  lines: CartLine[];
  paymentMethod: CheckoutPaymentMethod;
  promotionCode?: string;
  shippingAddress?: string;
  shippingNote?: string;
}

export async function estimateCheckoutShipping(input: {
  productPriceVnd: number;
  receiverProvince: string;
  weightG: number;
}): Promise<ShippingEstimate> {
  const response = await fetch(commerceApiUrl("/shipping/estimate"), {
    body: JSON.stringify(input),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("CHECKOUT_SHIPPING_ESTIMATE_FAILED");
  }

  return payload as ShippingEstimate;
}

export async function submitCheckout(input: SubmitCheckoutInput) {
  const lines = input.lines.map((line) => {
    if (!line.variantId) {
      throw new Error("CHECKOUT_LINE_VARIANT_MISSING");
    }

    return {
      courseSessionId: line.courseSessionId,
      quantity: line.quantity,
      variantId: line.variantId,
    };
  });
  const response = await fetch(commerceApiUrl("/orders"), {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contactEmail: input.contactEmail,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      fulfillmentMethod: input.fulfillmentMethod,
      lines,
      paymentMethod: input.paymentMethod,
      promotionCode: input.promotionCode,
      shippingAddress: input.shippingAddress,
      shippingNote: input.shippingNote,
    }),
  });
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("CHECKOUT_CREATE_FAILED");
  }

  return payload;
}
