import type { Metadata } from "next";
import { DroneCard } from "@/components/drone-card";
import { SectionShell } from "@/components/section-shell";
import { getDroneModels } from "@/lib/content";
import { getTranslations } from "@/lib/i18n";

const copy = getTranslations("en");
export const metadata: Metadata = {
  title: copy.seo.productsTitle,
  description: copy.seo.productsDescription,
};

export default async function EnglishProductsPage() {
  const drones = getDroneModels("en");

  return (
    <SectionShell
      eyebrow={copy.pages.productsEyebrow}
      title={copy.pages.productsTitle}
      description={copy.pages.productsDescription}
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {drones.map((drone) => (
          <div key={drone.slug} id={drone.slug}>
            <DroneCard drone={drone} detailBasePath="/en/products" locale="en" />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
