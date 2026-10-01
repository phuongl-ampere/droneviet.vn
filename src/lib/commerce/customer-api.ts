export type CustomerProfile = {
  displayName: string | null;
  email: string;
  id: string;
  phone: string | null;
  roles: string[];
};

export type CustomerOrder = {
  createdAt: string;
  id: string;
  lines: Array<{
    id: string;
    quantity: number;
    title: string;
    unitPriceVnd: number;
  }>;
  orderNumber: string;
  paymentMethod: string;
  status: string;
  totalVnd: number;
};

export class CustomerUnauthenticatedError extends Error {
  constructor() {
    super("CUSTOMER_UNAUTHENTICATED");
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(commerceApiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const payload: unknown = await response.json();

  if (response.status === 401) {
    throw new CustomerUnauthenticatedError();
  }
  if (!response.ok) {
    throw new Error(
      typeof payload === "object" &&
        payload !== null &&
        "message" in payload &&
        typeof payload.message === "string"
        ? payload.message
        : "CUSTOMER_REQUEST_FAILED",
    );
  }

  return payload as T;
}

export const customerApi = {
  listOwnOrders: () => request<CustomerOrder[]>("/orders/me"),
  logout: async () => {
    await fetch(commerceApiUrl("/auth/logout"), {
      credentials: "include",
      method: "POST",
    });
  },
  profile: () => request<CustomerProfile>("/auth/profile"),
  session: () =>
    request<{ user: CustomerProfile | null }>("/auth/session"),
  resumePayosPayment: (orderNumber: string) =>
    request<{ checkoutUrl: string }>(
      `/orders/${encodeURIComponent(orderNumber)}/payment-resume`,
      {
        body: JSON.stringify({}),
        method: "POST",
      },
    ),
  updateProfile: (input: {
    displayName?: string;
    phone?: string;
  }) =>
    request<CustomerProfile>("/auth/profile", {
      body: JSON.stringify(input),
      method: "PATCH",
    }),
};
import { commerceApiUrl } from "./commerce-api-url";
