import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
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
  constructor(
    private readonly catalogService: CatalogService,
    private readonly auditService: AuditService,
  ) {}

  @Post("products")
  async createProduct(
    @Body() input: CreateProductDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    const product = await this.catalogService.createProduct(input);
    await this.auditService.record({
      action: "catalog.product.created",
      actorId: request.user?.sub,
      aggregateId: product.id,
      aggregateType: "product",
      nextState: { status: product.status },
    });
    return product;
  }

  @Post("products/:id/publish")
  async publishProduct(
    @Param("id") id: string,
    @Req() request: { user?: { sub?: string } },
  ) {
    const product = await this.catalogService.publishProduct(id);
    await this.auditService.record({
      action: "catalog.product.published",
      actorId: request.user?.sub,
      aggregateId: product.id,
      aggregateType: "product",
      nextState: { status: product.status },
    });
    return product;
  }
}
