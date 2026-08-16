export interface QuoteRequestInput {
  budgetVnd?: number;
  contactName: string;
  email?: string;
  organization: string;
  phone: string;
  quantity: number;
  requirements?: string;
}

export async function submitQuoteRequest(input: QuoteRequestInput) {
  const apiUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");

  if (!apiUrl) {
    throw new Error("Commerce API is not configured");
  }

  const response = await fetch(`${apiUrl}/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("Quote request could not be created");
  }

  return payload;
}
