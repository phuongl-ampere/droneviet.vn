export async function findGuestOrder(orderNumber: string, phone: string) {
  const apiUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");

  if (!apiUrl) {
    throw new Error("COMMERCE_API_NOT_CONFIGURED");
  }

  const query = new URLSearchParams({ phone });
  const response = await fetch(
    `${apiUrl}/orders/${encodeURIComponent(orderNumber)}?${query}`,
  );
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("ORDER_NOT_FOUND");
  }

  return payload;
}

export async function resumePayosPayment(
  orderNumber: string,
  phone?: string,
): Promise<{ checkoutUrl: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");

  if (!apiUrl) {
    throw new Error("COMMERCE_API_NOT_CONFIGURED");
  }

  const response = await fetch(
    `${apiUrl}/orders/${encodeURIComponent(orderNumber)}/payment-resume`,
    {
      body: JSON.stringify(phone ? { phone } : {}),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("PAYMENT_RESUME_FAILED");
  }

  return payload as { checkoutUrl: string };
}
