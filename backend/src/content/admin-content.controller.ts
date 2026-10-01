import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "../auth/entities/user.entity";
import { ContentService } from "./content.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { PublishArticleDto } from "./dto/publish-article.dto";
import { PublishProductContentDto } from "./dto/publish-product-content.dto";
import { UpdateArticleDraftDto } from "./dto/update-article-draft.dto";
import {
  ArticleSection,
  ContentStatus,
} from "./entities/article.entity";

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
    return this.contentService.createArticleDraft(input, request.user?.sub);
  }

  @Get("articles")
  listArticles(
    @Query("locale") locale?: string,
    @Query("section") section?: ArticleSection,
    @Query("status") status?: ContentStatus,
  ) {
    return this.contentService.listAdminArticles({ locale, section, status });
  }

  @Get("articles/:id")
  getArticle(@Param("id") id: string) {
    return this.contentService.getAdminArticle(id);
  }

  @Patch("articles/:id/draft")
  updateArticleDraft(
    @Param("id") id: string,
    @Body() input: UpdateArticleDraftDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    return this.contentService.updateArticleDraft(id, input, request.user?.sub);
  }

  @Post("articles/:id/publish")
  async publishArticle(
    @Param("id") id: string,
    @Body() input: PublishArticleDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    return this.contentService.publishArticle(id, input, request.user?.sub);
  }

  @Post("articles/:id/revisions/:revisionNumber/restore")
  restoreArticleRevision(
    @Param("id") id: string,
    @Param("revisionNumber") revisionNumber: string,
    @Req() request: { user?: { sub?: string } },
  ) {
    return this.contentService.restoreArticleRevision(
      id,
      Number(revisionNumber),
      request.user?.sub,
    );
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
