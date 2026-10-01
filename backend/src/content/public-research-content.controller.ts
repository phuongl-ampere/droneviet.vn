import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard, AccessTokenPayload } from "../auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "../auth/entities/user.entity";
import { CreateArticleCommentDto } from "./dto/create-article-comment.dto";
import { ReportArticleCommentDto } from "./dto/report-article-comment.dto";
import { UpsertArticleRatingDto } from "./dto/upsert-article-rating.dto";
import { ResearchEngagementService } from "./research-engagement.service";
import { ContentService } from "./content.service";

@Controller("content/research")
export class PublicResearchContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly engagement: ResearchEngagementService,
  ) {}

  @Get("articles")
  @UseGuards(OptionalJwtAuthGuard)
  async listArticles(
    @Req() request: { user?: AccessTokenPayload },
    @Query("locale") locale = "vi",
    @Query("cursor") cursor?: string,
  ) {
    const result = await this.contentService.listPublishedResearch(locale, cursor);

    return {
      items: await Promise.all(
        result.items.map(async (article) => ({
          ...article,
          rating: await this.engagement.getRating(article.id, request.user?.sub),
        })),
      ),
      nextCursor: result.nextCursor,
    };
  }

  @Get("articles/:slug")
  @UseGuards(OptionalJwtAuthGuard)
  async getArticle(
    @Param("slug") slug: string,
    @Req() request: { user?: AccessTokenPayload },
    @Query("locale") locale = "vi",
  ) {
    const article = await this.contentService.getPublishedResearch(slug, locale);

    return {
      ...article,
      commentCount: await this.engagement.countVisibleComments(article.id),
      rating: await this.engagement.getRating(article.id, request.user?.sub),
    };
  }

  @Get("articles/:slug/comments")
  @UseGuards(OptionalJwtAuthGuard)
  listComments(@Param("slug") slug: string) {
    return this.engagement.listComments(slug);
  }

  @Put("articles/:slug/rating")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  rate(
    @Param("slug") slug: string,
    @Body() input: UpsertArticleRatingDto,
    @Req() request: { user: AccessTokenPayload },
  ) {
    return this.engagement.rate(slug, request.user.sub, input.score);
  }

  @Delete("articles/:slug/rating")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  removeRating(
    @Param("slug") slug: string,
    @Req() request: { user: AccessTokenPayload },
  ) {
    return this.engagement.removeRating(slug, request.user.sub);
  }

  @Patch("comments/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  updateComment(
    @Param("id") id: string,
    @Body() input: CreateArticleCommentDto,
    @Req() request: { user: AccessTokenPayload },
  ) {
    return this.engagement.updateComment(id, request.user.sub, input);
  }

  @Delete("comments/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  deleteComment(
    @Param("id") id: string,
    @Req() request: { user: AccessTokenPayload },
  ) {
    return this.engagement.deleteComment(id, request.user.sub);
  }

  @Post("articles/:slug/comments")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createComment(
    @Param("slug") slug: string,
    @Body() input: CreateArticleCommentDto,
    @Req() request: { user: AccessTokenPayload },
  ) {
    return this.engagement.createComment(slug, request.user.sub, input);
  }

  @Post("comments/:id/reports")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  reportComment(
    @Param("id") id: string,
    @Body() input: ReportArticleCommentDto,
    @Req() request: { user: AccessTokenPayload },
  ) {
    return this.engagement.reportComment(id, request.user.sub, input);
  }
}
