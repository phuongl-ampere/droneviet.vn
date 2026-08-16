import { afterEach, describe, expect, it, vi } from "vitest";
import { listAdminOrders, transitionAdminOrder } from "./admin-api";

describe("admin commerce API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("lists orders with the current admin bearer token", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "http://commerce.test");
    const fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue([{ id: "order-1" }]),
      ok: true,
    });
    vi.stubGlobal("fetch", fetch);

    await expect(listAdminOrders("access-token")).resolves.toEqual([
      { id: "order-1" },
    ]);

    expect(fetch).toHaveBeenCalledWith(
      "http://commerce.test/admin/orders",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
      }),
    );
  });

  it("submits an operations transition for one order", async () => {
    vi.stubEnv("NEXT_PUBLIC_COMMERCE_API_URL", "http://commerce.test");
    const fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ id: "order-1", status: "packing" }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetch);

    await expect(
      transitionAdminOrder("access-token", "order-1", "packing"),
    ).resolves.toEqual({ id: "order-1", status: "packing" });

    expect(fetch).toHaveBeenCalledWith(
      "http://commerce.test/admin/orders/order-1/transition",
      expect.objectContaining({
        body: JSON.stringify({ nextStatus: "packing" }),
        method: "POST",
      }),
    );
  });
});
