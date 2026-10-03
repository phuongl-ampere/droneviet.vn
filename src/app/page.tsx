import { DroneHeroCarousel } from "@/components/drone-hero-carousel";
import { getSiteContent, type Locale } from "@/lib/content";

export function HomePageContent({ locale = "vi" }: { locale?: Locale }) {
  const site = getSiteContent(locale);

  return (
    <DroneHeroCarousel
      eyebrow={site.hero.eyebrow}
      title={site.hero.title}
      description={site.hero.description}
      primaryCta={site.hero.primaryCta}
      secondaryCta={site.hero.secondaryCta}
    />
  );
}

export default function Home() {
  return <HomePageContent locale="vi" />;
}
