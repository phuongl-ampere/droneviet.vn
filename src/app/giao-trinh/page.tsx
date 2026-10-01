import type { Metadata } from "next";
import { CurriculumCard } from "@/components/curriculum-card";
import { SectionShell } from "@/components/section-shell";
import { getCurriculumItems } from "@/lib/content";
import { getTranslations } from "@/lib/i18n";

const copy = getTranslations("vi");
export const metadata: Metadata = {
  title: copy.seo.curriculumTitle,
  description: copy.seo.curriculumDescription,
};

export default async function CurriculumPage() {
  const curriculum = getCurriculumItems();

  return (
    <SectionShell
      eyebrow={copy.pages.curriculumEyebrow}
      title={copy.pages.curriculumTitle}
      description={copy.pages.curriculumDescription}
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
