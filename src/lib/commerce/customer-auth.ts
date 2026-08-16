export interface CustomerSession {
  accessToken: string;
  user: {
    email: string;
    id: string;
    roles: string[];
  };
}

function apiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("Commerce API is not configured");
  }

  return `${baseUrl}${path}`;
}

async function request(
  path: string,
  payload: Record<string, string>,
): Promise<CustomerSession> {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Không thể xác thực tài khoản.");
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
