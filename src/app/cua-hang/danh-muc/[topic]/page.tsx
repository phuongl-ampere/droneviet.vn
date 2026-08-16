import { DronePillarDetail } from "@/components/drone-pillar-pages";
import { getDronePillar } from "@/lib/drone-pillars";

export function generateStaticParams() {
  return (getDronePillar("cua-hang")?.items ?? []).map((item) => ({
    topic: item.slug,
  }));
}

export default async function StoreCategoryPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;

  return <DronePillarDetail pillarSlug="cua-hang" topicSlug={topic} />;
}
