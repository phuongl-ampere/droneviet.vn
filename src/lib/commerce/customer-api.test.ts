import { afterEach, describe, expect, it, vi } from "vitest";
import {
  customerApi,
  CustomerUnauthenticatedError,
} from "./customer-api";

describe("customerApi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("loads the current profile with cookies and no bearer token", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: null,
        roles: ["customer"],
      }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(customerApi.profile()).resolves.toMatchObject({
      id: "customer-1",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/auth/profile",
      expect.objectContaining({
        credentials: "include",
      }),
    );
  });

  it("maps an expired cookie to an unauthenticated state", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "https://api.example.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ message: "Unauthorized" }),
        ok: false,
        status: 401,
      }),
    );

    await expect(customerApi.profile()).rejects.toBeInstanceOf(
      CustomerUnauthenticatedError,
    );
  });

  it("reads an anonymous session without treating it as an error", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ user: null }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(customerApi.session()).resolves.toEqual({ user: null });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/auth/session",
      expect.objectContaining({
        credentials: "include",
      }),
    );
  });

  it("resumes an authenticated PayOS order with the session cookie", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ checkoutUrl: "https://pay.example/resume" }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      customerApi.resumePayosPayment("DV-PAY0001"),
    ).resolves.toEqual({ checkoutUrl: "https://pay.example/resume" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/orders/DV-PAY0001/payment-resume",
      expect.objectContaining({
        body: JSON.stringify({}),
        credentials: "include",
        method: "POST",
      }),
    );
  });
});
