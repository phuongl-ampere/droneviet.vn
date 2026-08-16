import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "../auth/entities/user.entity";
import { ContentService } from "./content.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { PublishArticleDto } from "./dto/publish-article.dto";

@Controller("admin/content")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CATALOG_MANAGER,
  UserRole.INSTRUCTOR,
)
export class AdminContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post("articles")
  createArticle(@Body() input: CreateArticleDto) {
    return this.contentService.createArticle(input);
  }

  @Post("articles/:id/publish")
  publishArticle(@Param("id") id: string, @Body() input: PublishArticleDto) {
    return this.contentService.publishArticle(id, input);
  }
}
