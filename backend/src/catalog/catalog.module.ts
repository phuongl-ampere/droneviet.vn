import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AuditModule } from "../audit/audit.module";
import { AdminCatalogController } from "./admin-catalog.controller";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { ProductVariant } from "./entities/product-variant.entity";
import { Product } from "./entities/product.entity";
import { InventoryItem } from "../inventory/entities/inventory-item.entity";

@Module({
  imports: [
    AuditModule,
    AuthModule,
    TypeOrmModule.forFeature([InventoryItem, Product, ProductVariant]),
  ],
  controllers: [CatalogController, AdminCatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
