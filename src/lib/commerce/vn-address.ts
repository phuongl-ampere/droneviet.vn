export type VnProvince = {
  id: string;
  name: string;
  slug: string;
};

export type VnWard = {
  id: string;
  name: string;
  slug: string;
};

let provincesCache: VnProvince[] | null = null;
const wardsCache = new Map<string, VnWard[]>();

export async function fetchVnProvinces(): Promise<VnProvince[]> {
  if (provincesCache) {
    return provincesCache;
  }

  const response = await fetch("/data/vn-provinces-2025.json");

  if (!response.ok) {
    throw new Error("VN_PROVINCES_LOAD_FAILED");
  }

  const provinces = (await response.json()) as VnProvince[];
  provincesCache = [...provinces].sort((left, right) =>
    left.name.localeCompare(right.name, "vi"),
  );

  return provincesCache;
}

export async function fetchVnWards(provinceSlug: string): Promise<VnWard[]> {
  const cached = wardsCache.get(provinceSlug);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `/api/vn-wards/${encodeURIComponent(provinceSlug)}`,
  );

  if (!response.ok) {
    throw new Error("VN_WARDS_LOAD_FAILED");
  }

  const wards = (await response.json()) as VnWard[];
  const sortedWards = [...wards].sort((left, right) =>
    left.name.localeCompare(right.name, "vi"),
  );
  wardsCache.set(provinceSlug, sortedWards);

  return sortedWards;
}
