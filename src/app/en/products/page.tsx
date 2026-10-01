import type { Metadata } from "next";
import { DroneCard } from "@/components/drone-card";
import { SectionShell } from "@/components/section-shell";
import { getDroneModels } from "@/lib/content";

export const metadata: Metadata = {
  title: "Drone products",
  description:
    "Drone product catalog for grade school, high school, university, instructors, and research labs.",
};

export default async function EnglishProductsPage() {
  const drones = getDroneModels("en");

  return (
    <SectionShell
      eyebrow="Product catalog"
      title="Drone products"
      description="Drone kits and hardware packages for classrooms, STEM centers, universities, and research labs."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {drones.map((drone) => (
          <div key={drone.slug} id={drone.slug}>
            <DroneCard drone={drone} detailBasePath="/en/products" ctaLabel="View details" />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
