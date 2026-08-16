import { DronePillarHub } from "@/components/drone-pillar-pages";
import { dronePillars } from "@/lib/drone-pillars";

export function generateStaticParams() {
  return dronePillars
    .filter((pillar) => pillar.slug !== "cua-hang")
    .map((pillar) => ({ pillar: pillar.slug }));
}

export default async function DronePillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;

  return <DronePillarHub slug={pillar} />;
}
