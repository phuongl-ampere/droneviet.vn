import type { Metadata } from "next";
import { SectionShell } from "@/components/section-shell";
import { ServiceCard } from "@/components/service-card";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dịch vụ drone nghiên cứu & giáo dục",
  description:
    "Dịch vụ tư vấn, cung cấp bộ drone, thiết kế nền tảng nghiên cứu, chuyển giao giáo trình, tập huấn và tổ chức workshop drone.",
};

export default async function ServicesPage() {
  const services = getServices();

  return (
    <SectionShell
      eyebrow="Services"
      title="Dịch vụ drone nghiên cứu & giáo dục"
      description="Các dịch vụ sản phẩm giúp đơn vị giáo dục và lab nghiên cứu triển khai drone từ ý tưởng đến lớp học, phòng lab và thử nghiệm thực tế."
      tone="dark"
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.slug} id={service.slug}>
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
