import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchVnProvinces, fetchVnWards } from "./vn-address";

describe("Vietnam address API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and caches alphabetically sorted provinces from the local endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => [
        { id: "79", name: "Hồ Chí Minh", slug: "ho-chi-minh-79" },
        { id: "01", name: "Hà Nội", slug: "ha-noi-01" },
      ],
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchVnProvinces()).resolves.toEqual([
      { id: "01", name: "Hà Nội", slug: "ha-noi-01" },
      { id: "79", name: "Hồ Chí Minh", slug: "ho-chi-minh-79" },
    ]);
    await fetchVnProvinces();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/data/vn-provinces-2025.json");
  });

  it("loads and caches wards through the province API endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => [
        { id: "2", name: "Phường Bến Nghé", slug: "phuong-ben-nghe" },
        { id: "1", name: "Phường Bến Thành", slug: "phuong-ben-thanh" },
      ],
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchVnWards("ho-chi-minh-79")).resolves.toEqual([
      { id: "2", name: "Phường Bến Nghé", slug: "phuong-ben-nghe" },
      { id: "1", name: "Phường Bến Thành", slug: "phuong-ben-thanh" },
    ]);
    await fetchVnWards("ho-chi-minh-79");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/vn-wards/ho-chi-minh-79",
    );
  });
});
