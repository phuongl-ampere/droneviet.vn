import { describe, expect, it } from "vitest";
import { ProductVariant } from "../catalog/entities/product-variant.entity";
import { Product } from "../catalog/entities/product.entity";
import { createDatabaseOptions } from "./data-source";

describe("createDatabaseOptions", () => {
  it("uses explicit MySQL migrations and never synchronizes schema at runtime", () => {
    const options = createDatabaseOptions({
      DATABASE_HOST: "localhost",
      DATABASE_PORT: "3306",
      DATABASE_NAME: "droneviet",
      DATABASE_PASSWORD: "droneviet",
      DATABASE_USER: "droneviet",
    });

    expect(options).toMatchObject({
      database: "droneviet",
      host: "localhost",
      port: 3306,
      synchronize: false,
      type: "mysql",
      username: "droneviet",
    });
    expect(options.entities).toEqual(
      expect.arrayContaining([Product, ProductVariant]),
    );
    expect(options.migrations).toHaveLength(1);
  });
});
