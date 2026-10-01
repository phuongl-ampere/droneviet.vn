import type { Metadata } from "next";
import { DroneCard } from "@/components/drone-card";
import { SectionShell } from "@/components/section-shell";
import { getDroneModels } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sản phẩm drone",
  description:
    "Danh mục sản phẩm drone cho cấp 1, cấp 2, cấp 3, đại học, giảng viên và lab nghiên cứu.",
};

export default async function ProductsPage() {
  const drones = getDroneModels();

  return (
    <SectionShell
      eyebrow="Product catalog"
      title="Sản phẩm drone"
      description="Danh mục các mẫu drone và bộ thiết bị có thể dùng trong lớp học, trung tâm STEM, đại học và lab nghiên cứu."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {drones.map((drone) => (
          <div key={drone.slug} id={drone.slug}>
            <DroneCard drone={drone} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
