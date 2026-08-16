import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "../auth/entities/user.entity";
import { ContentService } from "./content.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { PublishArticleDto } from "./dto/publish-article.dto";
import { PublishProductContentDto } from "./dto/publish-product-content.dto";

@Controller("admin/content")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CATALOG_MANAGER,
  UserRole.INSTRUCTOR,
)
export class AdminContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly auditService: AuditService,
  ) {}

  @Post("articles")
  async createArticle(
    @Body() input: CreateArticleDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    const article = await this.contentService.createArticle(input);
    await this.auditService.record({
      action: "content.article.created",
      actorId: request.user?.sub,
      aggregateId: article.id,
      aggregateType: "article",
      nextState: { status: article.status },
    });
    return article;
  }

  @Post("articles/:id/publish")
  async publishArticle(
    @Param("id") id: string,
    @Body() input: PublishArticleDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    const article = await this.contentService.publishArticle(id, input);
    await this.auditService.record({
      action: "content.article.published",
      actorId: request.user?.sub,
      aggregateId: article.id,
      aggregateType: "article",
      nextState: { revisionNumber: article.revisionNumber, status: article.status },
    });
    return article;
  }

  @Post("products/:id/publish")
  async publishProductContent(
    @Param("id") id: string,
    @Body() input: PublishProductContentDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    const content = await this.contentService.publishProductContent(id, input);
    await this.auditService.record({
      action: "content.product.published",
      actorId: request.user?.sub,
      aggregateId: id,
      aggregateType: "product",
      nextState: { locale: content.locale },
    });
    return content;
  }
}
