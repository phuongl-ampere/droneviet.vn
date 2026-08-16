export type CoursePurchaseMode = "checkout" | "quote_only";

export interface StoreCourse {
  format: string;
  level: string;
  priceVnd: number;
  purchaseMode: CoursePurchaseMode;
  seatsRemaining?: number;
  sessionLabel: string;
  slug: string;
  summary: string;
  title: string;
}

export const storeCourses: StoreCourse[] = [
  {
    format: "8 buổi · Cấp 1",
    level: "Nhập môn STEM",
    priceVnd: 2_400_000,
    purchaseMode: "checkout",
    seatsRemaining: 8,
    sessionLabel: "Khai giảng 14/09",
    slug: "drone-nhap-mon-cap-1",
    summary:
      "An toàn bay, điều khiển cơ bản, lập trình khối lệnh và thử thách mê cung.",
    title: "Drone nhập môn cho cấp 1",
  },
  {
    format: "12 buổi · Cấp 2",
    level: "Lập trình drone",
    priceVnd: 3_600_000,
    purchaseMode: "checkout",
    seatsRemaining: 5,
    sessionLabel: "Khai giảng 21/09",
    slug: "lap-trinh-drone-cap-2",
    summary:
      "Thuật toán, tọa độ, cảm biến và nhiệm vụ bay theo nhóm.",
    title: "Lập trình drone cho cấp 2",
  },
  {
    format: "10 buổi · Cấp 3",
    level: "Project-based",
    priceVnd: 5_200_000,
    purchaseMode: "checkout",
    seatsRemaining: 10,
    sessionLabel: "Khai giảng 05/10",
    slug: "du-an-drone-cap-3",
    summary:
      "Dự án ứng dụng drone với dữ liệu, camera, AI cơ bản và báo cáo kỹ thuật.",
    title: "Dự án drone ứng dụng cho cấp 3",
  },
  {
    format: "10 buổi · Đại học",
    level: "Lab syllabus",
    priceVnd: 0,
    purchaseMode: "quote_only",
    sessionLabel: "Theo lịch đơn vị",
    slug: "drone-ung-dung-dai-hoc",
    summary:
      "SDK drone, telemetry, computer vision và thiết kế lab report.",
    title: "Drone ứng dụng cho đại học",
  },
  {
    format: "Research protocol kit",
    level: "Nghiên cứu",
    priceVnd: 0,
    purchaseMode: "quote_only",
    sessionLabel: "Theo scope đề tài",
    slug: "phuong-phap-nghien-cuu-voi-drone",
    summary:
      "Thiết kế protocol, thu thập dữ liệu, kiểm soát rủi ro và tái lập thí nghiệm.",
    title: "Phương pháp nghiên cứu với drone",
  },
];
