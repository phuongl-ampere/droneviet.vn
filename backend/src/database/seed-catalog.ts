import { EntityManager } from "typeorm";
import {
  Product,
  ProductKind,
  ProductStatus,
} from "../catalog/entities/product.entity";
import {
  ProductVariant,
  PurchaseMode,
} from "../catalog/entities/product-variant.entity";
import { InventoryItem } from "../inventory/entities/inventory-item.entity";
import {
  Course,
  CoursePurchaseMode,
} from "../courses/entities/course.entity";
import {
  CourseSession,
  CourseSessionStatus,
} from "../courses/entities/course-session.entity";
import { appDataSource } from "./data-source";

interface CommerceSeedProduct {
  id: string;
  kind: ProductKind;
  name: string;
  priceVnd: number;
  productVariantId: string;
  purchaseMode: PurchaseMode;
  quantity: number;
  sku: string;
  slug: string;
  summary: string;
  title: string;
}

export const commerceSeedProducts: CommerceSeedProduct[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    kind: ProductKind.DRONE,
    name: "DV Primary Lab",
    priceVnd: 9_500_000,
    productVariantId: "11111111-1111-4111-8111-111111111111",
    purchaseMode: PurchaseMode.CHECKOUT,
    quantity: 24,
    sku: "DV-PL-STD",
    slug: "dv-primary-lab",
    summary: "Nền tảng STEM an toàn để học tư duy bay và lập trình đầu tiên.",
    title: "Standard kit",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    kind: ProductKind.DRONE,
    name: "DV Code Fleet",
    priceVnd: 24_900_000,
    productVariantId: "22222222-2222-4222-8222-222222222222",
    purchaseMode: PurchaseMode.CHECKOUT,
    quantity: 12,
    sku: "DV-CF-STD",
    slug: "dv-code-fleet",
    summary: "Fleet drone cho lớp lập trình, robotics và hoạt động thi đấu.",
    title: "Standard fleet",
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    kind: ProductKind.DRONE,
    name: "DV AI Vision",
    priceVnd: 35_900_000,
    productVariantId: "33333333-3333-4333-8333-333333333333",
    purchaseMode: PurchaseMode.PREORDER,
    quantity: 0,
    sku: "DV-AIV-PRE",
    slug: "dv-ai-vision",
    summary: "Camera, telemetry và workflow dataset cho dự án AI/IoT.",
    title: "Pre-order",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    kind: ProductKind.DRONE,
    name: "DV Research Platform",
    priceVnd: 59_000_000,
    productVariantId: "44444444-4444-4444-8444-444444444444",
    purchaseMode: PurchaseMode.QUOTE_ONLY,
    quantity: 0,
    sku: "DV-RP-QUOTE",
    slug: "dv-research-platform",
    summary: "Platform mở cho payload cảm biến, thử nghiệm và nghiên cứu.",
    title: "Research lab",
  },
  {
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    kind: ProductKind.EDUCATION_KIT,
    name: "DV Instructor Kit",
    priceVnd: 12_800_000,
    productVariantId: "55555555-5555-4555-8555-555555555555",
    purchaseMode: PurchaseMode.CHECKOUT,
    quantity: 8,
    sku: "DV-IK-STD",
    slug: "dv-instructor-kit",
    summary: "Thiết bị và tài liệu để triển khai workshop cùng giảng viên.",
    title: "Instructor kit",
  },
  {
    id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    kind: ProductKind.COURSE,
    name: "Drone nhập môn cho cấp 1",
    priceVnd: 2_400_000,
    productVariantId: "66666666-6666-4666-8666-666666666666",
    purchaseMode: PurchaseMode.CHECKOUT,
    quantity: 8,
    sku: "DV-COURSE-G1",
    slug: "course-drone-nhap-mon-cap-1",
    summary: "Khóa học an toàn bay và lập trình khối lệnh.",
    title: "Khai giảng 14/09",
  },
  {
    id: "12121212-1212-4121-8121-121212121212",
    kind: ProductKind.COURSE,
    name: "Lập trình drone cho cấp 2",
    priceVnd: 3_600_000,
    productVariantId: "77777777-7777-4777-8777-777777777777",
    purchaseMode: PurchaseMode.CHECKOUT,
    quantity: 5,
    sku: "DV-COURSE-G2",
    slug: "course-lap-trinh-drone-cap-2",
    summary: "Khóa học tọa độ, cảm biến và nhiệm vụ bay theo nhóm.",
    title: "Khai giảng 21/09",
  },
  {
    id: "13131313-1313-4131-8131-131313131313",
    kind: ProductKind.COURSE,
    name: "Dự án drone ứng dụng cho cấp 3",
    priceVnd: 5_200_000,
    productVariantId: "88888888-8888-4888-8888-888888888888",
    purchaseMode: PurchaseMode.CHECKOUT,
    quantity: 10,
    sku: "DV-COURSE-G3",
    slug: "course-du-an-drone-cap-3",
    summary: "Khóa học dự án drone với dữ liệu và AI cơ bản.",
    title: "Khai giảng 05/10",
  },
];

const commerceSeedCourses = [
  {
    id: "14141414-1414-4141-8141-141414141414",
    locale: "vi",
    purchaseMode: CoursePurchaseMode.CHECKOUT,
    productVariantId: "66666666-6666-4666-8666-666666666666",
    slug: "drone-nhap-mon-cap-1",
    summary: "An toàn bay, điều khiển cơ bản và lập trình khối lệnh.",
    title: "Drone nhập môn cho cấp 1",
    tuitionVnd: 2_400_000,
  },
  {
    id: "15151515-1515-4151-8151-151515151515",
    locale: "vi",
    purchaseMode: CoursePurchaseMode.CHECKOUT,
    productVariantId: "77777777-7777-4777-8777-777777777777",
    slug: "lap-trinh-drone-cap-2",
    summary: "Tọa độ, cảm biến và nhiệm vụ bay theo nhóm.",
    title: "Lập trình drone cho cấp 2",
    tuitionVnd: 3_600_000,
  },
  {
    id: "16161616-1616-4161-8161-161616161616",
    locale: "vi",
    purchaseMode: CoursePurchaseMode.CHECKOUT,
    productVariantId: "88888888-8888-4888-8888-888888888888",
    slug: "du-an-drone-cap-3",
    summary: "Dự án drone với dữ liệu, camera và AI cơ bản.",
    title: "Dự án drone ứng dụng cho cấp 3",
    tuitionVnd: 5_200_000,
  },
] as const;

const commerceSeedSessions = [
  {
    capacity: 8,
    courseId: "14141414-1414-4141-8141-141414141414",
    id: "99999999-9999-4999-8999-999999999999",
    reservedSeats: 0,
    startsAt: new Date("2026-09-14T09:00:00.000Z"),
    status: CourseSessionStatus.OPEN,
  },
  {
    capacity: 5,
    courseId: "15151515-1515-4151-8151-151515151515",
    id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    reservedSeats: 0,
    startsAt: new Date("2026-09-21T09:00:00.000Z"),
    status: CourseSessionStatus.OPEN,
  },
  {
    capacity: 10,
    courseId: "16161616-1616-4161-8161-161616161616",
    id: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
    reservedSeats: 0,
    startsAt: new Date("2026-10-05T09:00:00.000Z"),
    status: CourseSessionStatus.OPEN,
  },
] as const;

export async function seedCatalogProducts(manager: EntityManager): Promise<void> {
  const productRepository = manager.getRepository(Product);
  const variantRepository = manager.getRepository(ProductVariant);
  const inventoryRepository = manager.getRepository(InventoryItem);
  const courseRepository = manager.getRepository(Course);
  const sessionRepository = manager.getRepository(CourseSession);

  await productRepository.upsert(
    commerceSeedProducts.map((product) => ({
      id: product.id,
      coverImageUrl: null,
      kind: product.kind,
      name: product.name,
      slug: product.slug,
      status: ProductStatus.PUBLISHED,
      summary: product.summary,
    })),
    ["id"],
  );
  await variantRepository.upsert(
    commerceSeedProducts.map((product) => ({
      id: product.productVariantId,
      compareAtVnd: null,
      isActive: true,
      priceVnd: product.priceVnd,
      productId: product.id,
      purchaseMode: product.purchaseMode,
      sku: product.sku,
      title: product.title,
    })),
    ["id"],
  );
  await inventoryRepository.upsert(
    commerceSeedProducts.map((product) => ({
      onHand: product.quantity,
      productVariantId: product.productVariantId,
    })),
    ["productVariantId"],
  );
  await courseRepository.upsert([...commerceSeedCourses], ["id"]);
  await sessionRepository.upsert([...commerceSeedSessions], ["id"]);
}

async function main(): Promise<void> {
  await appDataSource.initialize();
  await appDataSource.transaction(seedCatalogProducts);
  await appDataSource.destroy();
}

if (require.main === module) {
  void main();
}
