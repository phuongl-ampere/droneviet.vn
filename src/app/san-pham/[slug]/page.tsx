import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { getDroneModels } from "@/lib/content";
import { getLocalizedAlternates } from "@/lib/seo";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getDroneModels("vi").map((drone) => ({ slug: drone.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const drone = getDroneModels("vi").find((item) => item.slug === slug);

  if (!drone) {
    return { title: "Không tìm thấy sản phẩm" };
  }

  return {
    title: drone.name,
    description: drone.summary,
    alternates: {
      canonical: `/san-pham/${drone.slug}`,
      languages: getLocalizedAlternates(`/san-pham/${drone.slug}`, `/en/products/${drone.slug}`),
    },
    openGraph: {
      title: `${drone.name} | Drone Việt`,
      description: drone.summary,
      url: `/san-pham/${drone.slug}`,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const drone = getDroneModels("vi").find((item) => item.slug === slug);

  if (!drone) {
    notFound();
  }

  return <ProductDetail drone={drone} locale="vi" />;
}

