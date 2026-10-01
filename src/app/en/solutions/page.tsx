import type { Metadata } from "next";
import { DroneCard } from "@/components/drone-card";
import { SectionShell } from "@/components/section-shell";
import { getDroneModels } from "@/lib/content";

export const metadata: Metadata = {
  title: "Drone research & education solutions",
  description:
    "Drone solution packages for schools, STEM centers, universities, and research labs.",
};

export default async function EnglishSolutionsPage() {
  const drones = getDroneModels("en");

  return (
    <SectionShell
      eyebrow="Solution system"
      title="Drone research & education solutions"
      description="Hardware, curriculum, data, and deployment paths for each learning or research context."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {drones.map((drone) => (
          <div key={drone.slug} id={drone.slug}>
            <DroneCard drone={drone} detailBasePath="/en/products" ctaLabel="View details" />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
