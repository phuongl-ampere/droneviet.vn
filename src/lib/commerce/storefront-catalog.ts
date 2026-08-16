export type StoreCollection =
  | "accessories"
  | "research"
  | "stem"
  | "training";

export type StoreAvailability = "in_stock" | "preorder" | "quote_only";

export type StorePurchaseMode = "checkout" | "preorder" | "quote_only";

export interface StoreProduct {
  slug: string;
  name: string;
  summary: string;
  collection: StoreCollection;
  availability: StoreAvailability;
  purchaseMode: StorePurchaseMode;
  priceVnd: number;
  compareAtVnd?: number;
  badge?: string;
  specs: Array<{ label: string; value: string }>;
  accent: "aqua" | "graphite" | "ice" | "sand";
}

export interface StoreProductFilter {
  availability?: StoreAvailability;
  collection?: StoreCollection;
  purchaseMode?: StorePurchaseMode;
}

export const storeProducts: StoreProduct[] = [
  {
    slug: "dv-primary-lab",
    name: "DV Primary Lab",
    summary: "Nền tảng STEM an toàn để học tư duy bay và lập trình đầu tiên.",
    collection: "stem",
    availability: "in_stock",
    purchaseMode: "checkout",
    priceVnd: 9_500_000,
    badge: "Bán chạy",
    accent: "ice",
    specs: [
      { label: "Đối tượng", value: "Cấp 1-2" },
      { label: "Nhóm học", value: "2-4 học sinh" },
    ],
  },
  {
    slug: "dv-code-fleet",
    name: "DV Code Fleet",
    summary: "Fleet drone cho lớp lập trình, robotics và hoạt động thi đấu.",
    collection: "stem",
    availability: "in_stock",
    purchaseMode: "checkout",
    priceVnd: 24_900_000,
    compareAtVnd: 27_500_000,
    accent: "aqua",
    specs: [
      { label: "Quy mô", value: "5-10 drone" },
      { label: "Nội dung", value: "Code + robotics" },
    ],
  },
  {
    slug: "dv-ai-vision",
    name: "DV AI Vision",
    summary: "Camera, telemetry và workflow dataset cho dự án AI/IoT.",
    collection: "research",
    availability: "preorder",
    purchaseMode: "preorder",
    priceVnd: 35_900_000,
    badge: "Đặt trước",
    accent: "graphite",
    specs: [
      { label: "Dữ liệu", value: "Flight logs" },
      { label: "Hướng nghiên cứu", value: "AI/IoT" },
    ],
  },
  {
    slug: "dv-research-platform",
    name: "DV Research Platform",
    summary: "Platform mở cho payload cảm biến, thử nghiệm và nghiên cứu.",
    collection: "research",
    availability: "quote_only",
    purchaseMode: "quote_only",
    priceVnd: 59_000_000,
    badge: "Báo giá lab",
    accent: "sand",
    specs: [
      { label: "Payload", value: "Camera + sensor" },
      { label: "Dữ liệu", value: "Telemetry" },
    ],
  },
  {
    slug: "dv-instructor-kit",
    name: "DV Instructor Kit",
    summary: "Thiết bị và tài liệu để triển khai workshop cùng đội ngũ giảng viên.",
    collection: "training",
    availability: "in_stock",
    purchaseMode: "checkout",
    priceVnd: 12_800_000,
    accent: "ice",
    specs: [
      { label: "Đào tạo", value: "1-2 ngày" },
      { label: "Hỗ trợ", value: "Remote/on-site" },
    ],
  },
];

export function filterStoreProducts(
  products: StoreProduct[],
  filter: StoreProductFilter,
): StoreProduct[] {
  return products.filter((product) => {
    if (filter.collection && product.collection !== filter.collection) {
      return false;
    }

    if (filter.availability && product.availability !== filter.availability) {
      return false;
    }

    if (filter.purchaseMode && product.purchaseMode !== filter.purchaseMode) {
      return false;
    }

    return true;
  });
}

export function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
    maximumFractionDigits: 0,
  }).format(value);
}
