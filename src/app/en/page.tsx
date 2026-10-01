import type { Metadata } from "next";
import { HomePageContent } from "@/components/home-page-content";
import { getTranslations } from "@/lib/i18n";

const copy = getTranslations("en");
export const metadata: Metadata = {
  title: copy.seo.homeTitle,
  description: copy.seo.homeDescription,
};

export default function EnglishHomePage() {
  return <HomePageContent locale="en" />;
}
