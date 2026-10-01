import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { getDroneModels } from "@/lib/content";
import { getLocalizedAlternates } from "@/lib/seo";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getDroneModels("en").map((drone) => ({ slug: drone.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const drone = getDroneModels("en").find((item) => item.slug === slug);

  if (!drone) {
    return { title: "Product not found" };
  }

  return {
    title: drone.name,
    description: drone.summary,
    alternates: {
      canonical: `/en/products/${drone.slug}`,
      languages: getLocalizedAlternates(`/san-pham/${drone.slug}`, `/en/products/${drone.slug}`),
    },
    openGraph: {
      title: `${drone.name} | Drone Viet`,
      description: drone.summary,
      url: `/en/products/${drone.slug}`,
      type: "website",
    },
  };
}

export default async function EnglishProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const drone = getDroneModels("en").find((item) => item.slug === slug);

  if (!drone) {
    notFound();
  }

  return <ProductDetail drone={drone} locale="en" />;
}

