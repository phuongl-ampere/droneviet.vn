import type { Metadata } from "next";
import { CurriculumCard } from "@/components/curriculum-card";
import { SectionShell } from "@/components/section-shell";
import { getCurriculumItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "Drone curriculum",
  description:
    "Completed drone curriculum, syllabi, and research protocol materials from grade school to university.",
};

export default async function EnglishCurriculumPage() {
  const curriculum = getCurriculumItems("en");

  return (
    <SectionShell
      eyebrow="Curriculum"
      title="Drone curriculum from grade school to university"
      description="Structured learning paths and lab materials for each level."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {curriculum.map((item) => (
          <div key={item.slug} id={item.slug}>
            <CurriculumCard item={item} href={`/en/curriculum#${item.slug}`} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
