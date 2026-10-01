import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/vn-wards/[slug]", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps the upstream administrative API response to checkout ward options", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        children: {
          entities: [
            {
              id: "26740",
              name_local: "Phường Bến Nghé",
              slug: "phuong-ben-nghe",
            },
          ],
        },
      }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "ho-chi-minh-79" }),
    });

    await expect(response.json()).resolves.toEqual([
      {
        id: "26740",
        name: "Phường Bến Nghé",
        slug: "phuong-ben-nghe",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://openadmindata.org/api/v1/vn/province/ho-chi-minh-79.json",
      { next: { revalidate: 86400 } },
    );
  });
});
