type WardEntity = {
  id: string;
  name_local: string;
  slug: string;
};

const openAdminApi = "https://openadmindata.org/api/v1/vn/province";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug) {
    return Response.json({ message: "slug required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${openAdminApi}/${encodeURIComponent(slug)}.json`,
      { next: { revalidate: 60 * 60 * 24 } },
    );

    if (!response.ok) {
      return Response.json({ message: "Province not found" }, { status: 404 });
    }

    const data = (await response.json()) as {
      children?: { entities?: WardEntity[] };
    };
    const wards = (data.children?.entities ?? []).map((ward) => ({
      id: ward.id,
      name: ward.name_local,
      slug: ward.slug,
    }));

    return Response.json(wards);
  } catch {
    return Response.json(
      { message: "Failed to fetch wards" },
      { status: 502 },
    );
  }
}
