import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "../auth/entities/user.entity";
import { CatalogService } from "./catalog.service";
import { CreateProductDto } from "./dto/create-product.dto";

@Controller("admin/catalog")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.CATALOG_MANAGER)
export class AdminCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post("products")
  createProduct(@Body() input: CreateProductDto) {
    return this.catalogService.createProduct(input);
  }
}
