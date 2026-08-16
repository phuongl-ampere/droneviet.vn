export async function findGuestOrder(orderNumber: string, phone: string) {
  const apiUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");

  if (!apiUrl) {
    throw new Error("Commerce API is not configured");
  }

  const query = new URLSearchParams({ phone });
  const response = await fetch(
    `${apiUrl}/orders/${encodeURIComponent(orderNumber)}?${query}`,
  );
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("Order was not found");
  }

  return payload;
}
