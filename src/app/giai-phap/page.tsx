import type { Metadata } from "next";
import { DroneCard } from "@/components/drone-card";
import { SectionShell } from "@/components/section-shell";
import { getDroneModels } from "@/lib/content";

export const metadata: Metadata = {
  title: "Giải pháp drone nghiên cứu & giáo dục",
  description:
    "Bộ giải pháp drone cho nghiên cứu và giáo dục từ cấp 1 đến đại học.",
};

export default async function SolutionsPage() {
  const drones = getDroneModels();

  return (
    <SectionShell
      eyebrow="Solution system"
      title="Giải pháp drone nghiên cứu & giáo dục"
      description="Các cấu hình mẫu giúp trường phổ thông, trung tâm STEM, đại học và lab nghiên cứu chọn đúng thiết bị, học liệu, dữ liệu và mục tiêu triển khai."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {drones.map((drone) => (
          <div key={drone.slug} id={drone.slug}>
            <DroneCard drone={drone} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
