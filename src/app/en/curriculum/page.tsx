import type { Metadata } from "next";
import { CurriculumCard } from "@/components/curriculum-card";
import { SectionShell } from "@/components/section-shell";
import { getCurriculumItems } from "@/lib/content";
import { getTranslations } from "@/lib/i18n";

const copy = getTranslations("en");
export const metadata: Metadata = {
  title: copy.seo.curriculumTitle,
  description: copy.seo.curriculumDescription,
};

export default async function EnglishCurriculumPage() {
  const curriculum = getCurriculumItems("en");

  return (
    <SectionShell
      eyebrow={copy.pages.curriculumEyebrow}
      title={copy.pages.curriculumTitle}
      description={copy.pages.curriculumDescription}
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
