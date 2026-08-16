import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { ProductVariant } from "../catalog/entities/product-variant.entity";
import { Product } from "../catalog/entities/product.entity";
import { Article } from "../content/entities/article.entity";
import { ContentRevision } from "../content/entities/content-revision.entity";
import { User } from "../auth/entities/user.entity";
import { OrderLine } from "../orders/entities/order-line.entity";
import { Order } from "../orders/entities/order.entity";
import { QuoteRequest } from "../quotes/entities/quote-request.entity";
import { InitialCatalogMigration1766918700000 } from "./migrations/1766918700000-initial-catalog";
import { ContentMigration1766918800000 } from "./migrations/1766918800000-content";
import { UsersMigration1766918900000 } from "./migrations/1766918900000-users";
import { OrdersMigration1766919000000 } from "./migrations/1766919000000-orders";
import { QuoteRequestsMigration1766919100000 } from "./migrations/1766919100000-quote-requests";

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
      User,
      Order,
      OrderLine,
      QuoteRequest,
    ],
    migrations: [
      InitialCatalogMigration1766918700000,
      ContentMigration1766918800000,
      UsersMigration1766918900000,
      OrdersMigration1766919000000,
      QuoteRequestsMigration1766919100000,
    ],
    synchronize: false,
  };
}

export const appDataSource = new DataSource(createDatabaseOptions(process.env));
