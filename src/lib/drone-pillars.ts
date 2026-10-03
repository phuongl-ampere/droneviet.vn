export type DronePillar = {
  description: string;
  eyebrow: string;
  href: string;
  image: string;
  items: Array<{
    description: string;
    href: string;
    slug: string;
    title: string;
  }>;
  slug: string;
  title: string;
};

const shopHref = (category: string) => `/cua-hang?category=${category}`;

export const dronePillars: DronePillar[] = [
  {
    slug: "dao-tao-chung-chi",
    title: "Đào tạo & Chứng chỉ",
    eyebrow: "Flight training",
    href: "/dao-tao-chung-chi",
    image: "/store/quadcopter-flight-01.jpg",
    description:
      "Lộ trình học lái drone, an toàn bay và năng lực vận hành cho cá nhân, đội ngũ doanh nghiệp.",
    items: [
      { slug: "event-trai-nghiem", title: "Event/trải nghiệm drone", href: "/dao-tao-chung-chi/event-trai-nghiem", description: "Hoạt động bay trải nghiệm có hướng dẫn an toàn." },
      { slug: "chung-chi-lai-drone", title: "Chứng chỉ lái drone", href: "/dao-tao-chung-chi/chung-chi-lai-drone", description: "Lộ trình năng lực từ kiểm tra an toàn đến thực hành điều khiển." },
      { slug: "lo-trinh-ca-nhan-doanh-nghiep", title: "Lộ trình học cá nhân/doanh nghiệp", href: "/dao-tao-chung-chi/lo-trinh-ca-nhan-doanh-nghiep", description: "Khung chương trình theo mục tiêu cá nhân hoặc đội vận hành." },
      { slug: "dao-tao-an-toan-bay", title: "Đào tạo an toàn bay", href: "/dao-tao-chung-chi/dao-tao-an-toan-bay", description: "Checklist, quy trình bay và xử lý tình huống vận hành." },
      { slug: "dang-ky-khoa-hoc", title: "Đăng ký khóa học", href: "/dao-tao-chung-chi/dang-ky-khoa-hoc", description: "Chọn khóa học, lịch khai giảng và hình thức tư vấn." },
    ],
  },
  {
    slug: "drone-giao-duc",
    title: "Drone Giáo Dục",
    eyebrow: "Education",
    href: "/drone-giao-duc",
    image: "/store/quadcopter-flight-02.jpg",
    description:
      "Thiết bị, giáo trình và mô hình lab drone cho học sinh cấp 2, cấp 3 và sinh viên.",
    items: [
      { slug: "cap-2", title: "Cấp 2", href: "/drone-giao-duc/cap-2", description: "Lập trình, thuật toán và teamwork với drone theo đội hình." },
      { slug: "cap-3", title: "Cấp 3", href: "/drone-giao-duc/cap-3", description: "AI, dữ liệu cảm biến và dự án nghiên cứu học sinh." },
      { slug: "sinh-vien-dai-hoc", title: "Sinh viên/đại học", href: "/drone-giao-duc/sinh-vien-dai-hoc", description: "SDK, computer vision, telemetry và bài toán R&D." },
      { slug: "giao-trinh-drone", title: "Giáo trình drone", href: "/drone-giao-duc/giao-trinh-drone", description: "Syllabus, bài giảng, rubric và tài liệu an toàn." },
      { slug: "thiet-bi-lab", title: "Thiết bị/lab drone cho trường học", href: "/drone-giao-duc/thiet-bi-lab", description: "Gói thiết bị, không gian và quy trình vận hành lab." },
      { slug: "dao-tao-giao-vien", title: "Đào tạo giáo viên", href: "/drone-giao-duc/dao-tao-giao-vien", description: "Chuẩn bị đội ngũ đứng lớp và quản trị an toàn." },
      { slug: "workshop-truong-hoc", title: "Workshop trường học", href: "/drone-giao-duc/workshop-truong-hoc", description: "Workshop theo khối lớp, mục tiêu STEM và không gian thực tế." },
    ],
  },
  {
    slug: "cua-hang",
    title: "Cửa hàng",
    eyebrow: "Equipment",
    href: "/cua-hang",
    image: "/store/quadcopter-flight-03.jpg",
    description:
      "Drone, phụ kiện, linh kiện và các gói classroom/lab để triển khai ngay.",
    items: [
      { slug: "drone", title: "Drone", href: shopHref("drone"), description: "Drone theo nhu cầu học tập, vận hành và nghiên cứu." },
      { slug: "phu-kien-linh-kien", title: "Phụ kiện & Linh kiện", href: shopHref("parts"), description: "Pin, bảo vệ, sạc, cảm biến và thành phần thay thế." },
      { slug: "drone-giao-duc-combo-lab", title: "Drone giáo dục & Combo classroom/lab", href: shopHref("education"), description: "Thiết bị drone, học liệu và combo theo quy mô lớp." },
    ],
  },
  {
    slug: "bay-hop-phap",
    title: "Cấp phép bay",
    eyebrow: "Flight compliance",
    href: "/bay-hop-phap",
    image: "/store/quadcopter-flight-01.jpg",
    description:
      "Tài liệu thực hành để chuẩn bị hồ sơ, hiểu quy định và kiểm tra khu vực bay.",
    items: [
      { slug: "xin-cap-phep-bay", title: "Hướng dẫn xin cấp phép bay", href: "/bay-hop-phap/xin-cap-phep-bay", description: "Các bước chuẩn bị hồ sơ và kế hoạch chuyến bay." },
      { slug: "quy-dinh-phap-ly", title: "Quy định pháp lý drone", href: "/bay-hop-phap/quy-dinh-phap-ly", description: "Nội dung pháp lý cần kiểm tra trước vận hành." },
      { slug: "ban-do-cam-bay", title: "Bản đồ khu vực cấm/hạn chế bay", href: "/bay-hop-phap/ban-do-cam-bay", description: "Điểm bắt đầu để rà soát khu vực trước khi xin phép." },
    ],
  },
  {
    slug: "kien-thuc-rd",
    title: "Kiến thức & R&D",
    eyebrow: "Knowledge",
    href: "/kien-thuc-rd",
    image: "/store/quadcopter-flight-03.jpg",
    description:
      "Tin tức, nghiên cứu, case study và quy chuẩn kỹ thuật cho cộng đồng drone.",
    items: [
      { slug: "nghien-cuu-phat-trien", title: "Nghiên cứu và phát triển drone", href: "/kien-thuc-rd/nghien-cuu-phat-trien", description: "Bài toán R&D về bay, dữ liệu, AI và cảm biến." },
      { slug: "bao-cao-quy-chuan", title: "Báo cáo/quy chuẩn kỹ thuật", href: "/kien-thuc-rd/bao-cao-quy-chuan", description: "Tài liệu tham khảo để thiết kế và vận hành có kiểm soát." },
      { slug: "tin-tuc-drone", title: "Tin tức drone", href: "/kien-thuc-rd/tin-tuc-drone", description: "Tin tức, xu hướng và hoạt động drone đáng chú ý." },
    ],
  },
];

export function getDronePillar(slug: string) {
  return dronePillars.find((pillar) => pillar.slug === slug);
}

export function getDronePillarItem(pillarSlug: string, itemSlug: string) {
  return getDronePillar(pillarSlug)?.items.find((item) => item.slug === itemSlug);
}
