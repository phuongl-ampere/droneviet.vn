import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { ProductVariant } from "../catalog/entities/product-variant.entity";
import { Product } from "../catalog/entities/product.entity";
import { Article } from "../content/entities/article.entity";
import { ContentRevision } from "../content/entities/content-revision.entity";
import { InitialCatalogMigration1766918700000 } from "./migrations/1766918700000-initial-catalog";
import { ContentMigration1766918800000 } from "./migrations/1766918800000-content";

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
    entities: [Product, ProductVariant, Article, ContentRevision],
    migrations: [
      InitialCatalogMigration1766918700000,
      ContentMigration1766918800000,
    ],
    synchronize: false,
  };
}

export const appDataSource = new DataSource(createDatabaseOptions(process.env));
