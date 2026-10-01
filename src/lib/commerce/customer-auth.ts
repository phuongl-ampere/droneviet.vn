import type { CustomerProfile } from "./customer-api";
import { commerceApiUrl } from "./commerce-api-url";

export interface CustomerSession {
  accessToken: string;
  user: CustomerProfile;
}

async function request(
  path: string,
  payload: Record<string, string>,
): Promise<CustomerSession> {
  const response = await fetch(commerceApiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("AUTHENTICATION_FAILED");
  }

  return response.json() as Promise<CustomerSession>;
}

export function loginCustomer(email: string, password: string) {
  return request("/auth/login", { email, password });
}

export function registerCustomer(
  displayName: string,
  email: string,
  password: string,
) {
  return request("/auth/register", { displayName, email, password });
}
