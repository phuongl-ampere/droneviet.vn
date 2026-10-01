import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { ProductVariant } from "../catalog/entities/product-variant.entity";
import { Product } from "../catalog/entities/product.entity";
import { Article } from "../content/entities/article.entity";
import { ContentRevision } from "../content/entities/content-revision.entity";
import { ArticleMedia } from "../content/entities/article-media.entity";
import { ArticleComment } from "../content/entities/article-comment.entity";
import { ArticleCommentReport } from "../content/entities/article-comment-report.entity";
import { ArticleRating } from "../content/entities/article-rating.entity";
import { User } from "../auth/entities/user.entity";
import { OrderLine } from "../orders/entities/order-line.entity";
import { Order } from "../orders/entities/order.entity";
import { QuoteRequest } from "../quotes/entities/quote-request.entity";
import { InventoryItem } from "../inventory/entities/inventory-item.entity";
import { PaymentAttempt } from "../payments/entities/payment-attempt.entity";
import { ProductContent } from "../content/entities/product-content.entity";
import { Course } from "../courses/entities/course.entity";
import { CourseSession } from "../courses/entities/course-session.entity";
import { CourseEnrollment } from "../courses/entities/course-enrollment.entity";
import { AuditEvent } from "../audit/entities/audit-event.entity";
import { PromoCode } from "../promotions/entities/promo-code.entity";
import { InitialCatalogMigration1766918700000 } from "./migrations/1766918700000-initial-catalog";
import { ContentMigration1766918800000 } from "./migrations/1766918800000-content";
import { UsersMigration1766918900000 } from "./migrations/1766918900000-users";
import { OrdersMigration1766919000000 } from "./migrations/1766919000000-orders";
import { QuoteRequestsMigration1766919100000 } from "./migrations/1766919100000-quote-requests";
import { InventoryMigration1766919050000 } from "./migrations/1766919050000-inventory";
import { PaymentsMigration1766919200000 } from "./migrations/1766919200000-payments";
import { ProductContentMigration1766919300000 } from "./migrations/1766919300000-product-content";
import { CommerceHardeningMigration1766919400000 } from "./migrations/1766919400000-commerce-hardening";
import { CoursesMigration1766919500000 } from "./migrations/1766919500000-courses";
import { CourseOrderReservationsMigration1766919600000 } from "./migrations/1766919600000-course-order-reservations";
import { AuditEventsMigration1766919700000 } from "./migrations/1766919700000-audit-events";
import { PromotionsMigration1766919800000 } from "./migrations/1766919800000-promotions";
import { OrderLineInventoryReservationMigration1766919900000 } from "./migrations/1766919900000-order-line-inventory-reservation";
import { CourseVariantLinkMigration1766920000000 } from "./migrations/1766920000000-course-variant-link";
import { PaymentRefundReferenceMigration1766920100000 } from "./migrations/1766920100000-payment-refund-reference";
import { CustomerAccountMigration1766920200000 } from "./migrations/1766920200000-customer-account";
import { CheckoutFulfillmentMigration1766920300000 } from "./migrations/1766920300000-checkout-fulfillment";
import { ResearchArticleCmsMigration1766920400000 } from "./migrations/1766920400000-research-article-cms";

export function createDatabaseOptions(
  environment: NodeJS.ProcessEnv,
): DataSourceOptions {
  return {
    type: "mysql",
    host: environment.DATABASE_HOST ?? "localhost",
    port: Number(environment.DATABASE_PORT ?? 3306),
    username: environment.DATABASE_USER ?? "droneviet",
    password: environment.DATABASE_PASSWORD ?? "droneviet",
    database: environment.DATABASE_NAME ?? "droneviet",
    charset: "utf8mb4",
    entities: [
      Product,
      ProductVariant,
      Article,
      ContentRevision,
      ArticleMedia,
      ArticleComment,
      ArticleCommentReport,
      ArticleRating,
      User,
      Order,
      OrderLine,
      QuoteRequest,
      InventoryItem,
      PaymentAttempt,
      ProductContent,
      Course,
      CourseSession,
      CourseEnrollment,
      AuditEvent,
      PromoCode,
    ],
    migrations: [
      InitialCatalogMigration1766918700000,
      ContentMigration1766918800000,
      UsersMigration1766918900000,
      OrdersMigration1766919000000,
      InventoryMigration1766919050000,
      QuoteRequestsMigration1766919100000,
      PaymentsMigration1766919200000,
      ProductContentMigration1766919300000,
      CommerceHardeningMigration1766919400000,
      CoursesMigration1766919500000,
      CourseOrderReservationsMigration1766919600000,
      AuditEventsMigration1766919700000,
      PromotionsMigration1766919800000,
      OrderLineInventoryReservationMigration1766919900000,
      CourseVariantLinkMigration1766920000000,
      PaymentRefundReferenceMigration1766920100000,
      CustomerAccountMigration1766920200000,
      CheckoutFulfillmentMigration1766920300000,
      ResearchArticleCmsMigration1766920400000,
    ],
    synchronize: false,
  };
}

export const appDataSource = new DataSource(createDatabaseOptions(process.env));
