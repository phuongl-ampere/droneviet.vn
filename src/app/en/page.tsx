import type { Metadata } from "next";
import { HomePageContent } from "@/app/page";

export const metadata: Metadata = {
  title: "Drone research & education",
  description:
    "Drone solutions for research and education from grade school to university.",
};

export default function EnglishHomePage() {
  return <HomePageContent locale="en" />;
}

