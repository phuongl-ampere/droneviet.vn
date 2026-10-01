import type { Metadata } from "next";
import { CurriculumCard } from "@/components/curriculum-card";
import { SectionShell } from "@/components/section-shell";
import { getCurriculumItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "Giáo trình drone từ cấp 1 đến đại học",
  description:
    "Giáo trình, syllabus và tài liệu drone đã hoàn thành cho cấp 1, cấp 2, cấp 3, đại học và nghiên cứu.",
};

export default async function CurriculumPage() {
  const curriculum = getCurriculumItems();

  return (
    <SectionShell
      eyebrow="Curriculum"
      title="Giáo trình drone từ cấp 1 đến đại học"
      description="Mỗi cấp học và hướng nghiên cứu có mục tiêu đầu ra, module, tài liệu và định dạng triển khai riêng để đội ngũ đào tạo dùng được ngay."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {curriculum.map((item) => (
          <div key={item.slug} id={item.slug}>
            <CurriculumCard item={item} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
