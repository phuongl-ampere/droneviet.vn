import type { Metadata } from "next";
import { SectionShell } from "@/components/section-shell";
import { ServiceCard } from "@/components/service-card";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Drone services",
  description:
    "Consulting, drone kits, research platform design, curriculum transfer, instructor training, and workshops.",
};

export default async function EnglishServicesPage() {
  const services = getServices("en");

  return (
    <SectionShell
      eyebrow="Services"
      title="Drone research & education services"
      description="Services that help schools and research labs move from idea to real operation."
      tone="dark"
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.slug} id={service.slug}>
            <ServiceCard service={service} href={`/en/services#${service.slug}`} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
