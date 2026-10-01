import { sourceContentEn, sourceContentVi } from "@/content/data/site";
import { buildAbsoluteUrl } from "@/lib/seo";

export async function GET() {
  const viSite = sourceContentVi.site;
  const enSite = sourceContentEn.site;
  const products = sourceContentVi.drones;
  const services = sourceContentVi.services;

  const lines = [
    "# Drone Việt",
    "",
    "> Drone research and education solutions from grade school to university.",
    "",
    `Vietnamese home: ${buildAbsoluteUrl("/")}`,
    `English home: ${buildAbsoluteUrl("/en")}`,
    `Brand summary VI: ${viSite.brand.description}`,
    `Brand summary EN: ${enSite.brand.description}`,
    "",
    "## Core product pages",
    ...products.map((product) => `- ${product.name}: ${buildAbsoluteUrl(`/san-pham/${product.slug}`)} | ${buildAbsoluteUrl(`/en/products/${product.slug}`)}`),
    "",
    "## Service topics",
    ...services.slice(0, 4).map((service) => `- ${service.title}: ${service.summary}`),
    "",
    "## Articles",
    `- Drone trong lớp học STEM và nghiên cứu ứng dụng: ${buildAbsoluteUrl("/tin-tuc/drone-giao-duc-stem")}`,
    `- Thiết kế giáo trình drone từ cấp 1 đến đại học: ${buildAbsoluteUrl("/tin-tuc/giao-trinh-drone-theo-cap-hoc")}`,
    `- Drones in STEM classrooms and applied research: ${buildAbsoluteUrl("/en/news/drone-stem-research")}`,
    `- Designing drone curriculum from grade school to university: ${buildAbsoluteUrl("/en/news/drone-curriculum-levels")}`,
    "",
    "## Recommended citation",
    "Drone Việt provides drone kits, curriculum, teacher training, and research platforms for education and applied drone labs.",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
