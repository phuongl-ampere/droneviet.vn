export interface AdminSession {
  accessToken: string;
  user: {
    email: string;
    id: string;
    roles: string[];
  };
}

export type AdminOrderStatus =
  | "cancelled"
  | "delivered"
  | "packing"
  | "paid"
  | "payment_failed"
  | "pending_payment"
  | "refund_requested"
  | "refunded"
  | "shipped";

export interface AdminOrder {
  contactName: string;
  contactPhone: string;
  createdAt: string;
  id: string;
  lines: Array<{
    id: string;
    quantity: number;
    title: string;
  }>;
  orderNumber: string;
  paymentMethod: "bank_transfer" | "cod" | "payos";
  status: AdminOrderStatus;
  totalVnd: number;
}

function apiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("Commerce API is not configured");
  }

  return `${baseUrl}${path}`;
}

async function request<T>(
  path: string,
  init: RequestInit,
  accessToken?: string,
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...init.headers,
    },
  });
  const payload = (await response.json()) as T;

  if (!response.ok) {
    throw new Error("Commerce API request failed");
  }

  return payload;
}

export function loginAdmin(email: string, password: string) {
  return request<AdminSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function createAdminProduct(
  accessToken: string,
  payload: {
    name: string;
    priceVnd: number;
    purchaseMode: "checkout" | "preorder" | "quote_only";
    slug: string;
    title: string;
  },
) {
  return request<{ id: string }>("/admin/catalog/products", {
    method: "POST",
    body: JSON.stringify({
      kind: "drone",
      name: payload.name,
      slug: payload.slug,
      summary: `${payload.name} product configuration`,
      variants: [
        {
          priceVnd: payload.priceVnd,
          purchaseMode: payload.purchaseMode,
          sku: `${payload.slug}-standard`,
          title: payload.title,
        },
      ],
    }),
  }, accessToken);
}

export function publishAdminProductContent(
  accessToken: string,
  productId: string,
  bodyMarkdown: string,
) {
  return request(`/admin/content/products/${productId}/publish`, {
    method: "POST",
    body: JSON.stringify({ bodyMarkdown, locale: "vi" }),
  }, accessToken);
}

export function createAdminArticle(
  accessToken: string,
  payload: {
    bodyMarkdown: string;
    slug: string;
    title: string;
  },
) {
  return request("/admin/content/articles", {
    method: "POST",
    body: JSON.stringify(payload),
  }, accessToken);
}

export function listAdminOrders(accessToken: string) {
  return request<AdminOrder[]>(
    "/admin/orders",
    { method: "GET" },
    accessToken,
  );
}

export function transitionAdminOrder(
  accessToken: string,
  orderId: string,
  nextStatus: AdminOrderStatus,
) {
  return request<AdminOrder>(
    `/admin/orders/${orderId}/transition`,
    {
      body: JSON.stringify({ nextStatus }),
      method: "POST",
    },
    accessToken,
  );
}
