import { DronePillarDetail } from "@/components/drone-pillar-pages";
import { getDronePillars } from "@/lib/drone-pillars";

export function generateStaticParams() {
  return getDronePillars("en")
    .filter((pillar) => pillar.slug !== "cua-hang")
    .flatMap((pillar) =>
      pillar.items.map((item) => ({
        pillar: pillar.slug,
        topic: item.slug,
      })),
    );
}

export default async function EnglishDronePillarTopicPage({
  params,
}: {
  params: Promise<{ pillar: string; topic: string }>;
}) {
  const { pillar, topic } = await params;

  return (
    <DronePillarDetail
      locale="en"
      pillarSlug={pillar}
      topicSlug={topic}
    />
  );
}
