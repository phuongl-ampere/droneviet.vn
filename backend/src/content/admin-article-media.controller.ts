import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "../auth/entities/user.entity";
import { ArticleMediaService } from "./article-media.service";

@Controller("admin/content")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CATALOG_MANAGER,
  UserRole.INSTRUCTOR,
)
export class AdminArticleMediaController {
  constructor(private readonly mediaService: ArticleMediaService) {}

  @Get("media")
  list() {
    return this.mediaService.list();
  }

  @Post("media")
  @UseInterceptors(FileInterceptor("image", { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @UploadedFile()
    file:
      | { buffer: Buffer; mimetype: string; size: number }
      | undefined,
    @Body("alt") alt: string | undefined,
    @Body("articleId") articleId: string | undefined,
    @Req() request: { user?: { sub?: string } },
  ) {
    if (!file || !request.user?.sub) {
      throw new BadRequestException("ARTICLE_MEDIA_IMAGE_REQUIRED");
    }

    return this.mediaService.store(file, {
      alt: alt ?? "",
      articleId,
      uploaderId: request.user.sub,
    });
  }
}
