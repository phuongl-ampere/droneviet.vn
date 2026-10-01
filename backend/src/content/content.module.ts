import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AuditModule } from "../audit/audit.module";
import { AdminContentController } from "./admin-content.controller";
import { ContentService } from "./content.service";
import { MarkdownRendererService } from "./markdown-renderer.service";
import { RichTextRendererService } from "./rich-text-renderer.service";
import { Article } from "./entities/article.entity";
import { ContentRevision } from "./entities/content-revision.entity";
import { ArticleMedia } from "./entities/article-media.entity";
import { ArticleComment } from "./entities/article-comment.entity";
import { ArticleCommentReport } from "./entities/article-comment-report.entity";
import { ArticleRating } from "./entities/article-rating.entity";
import { AdminArticleMediaController } from "./admin-article-media.controller";
import { ArticleMediaController } from "./article-media.controller";
import { ArticleMediaService } from "./article-media.service";
import { PublicResearchContentController } from "./public-research-content.controller";
import { AdminCommentModerationController } from "./admin-comment-moderation.controller";
import { ResearchEngagementService } from "./research-engagement.service";

@Module({
  imports: [
    AuditModule,
    AuthModule,
    TypeOrmModule.forFeature([
      Article,
      ContentRevision,
      ArticleMedia,
      ArticleComment,
      ArticleCommentReport,
      ArticleRating,
    ]),
  ],
  controllers: [
    AdminContentController,
    AdminArticleMediaController,
    ArticleMediaController,
    PublicResearchContentController,
    AdminCommentModerationController,
  ],
  providers: [
    ContentService,
    MarkdownRendererService,
    RichTextRendererService,
    ArticleMediaService,
    ResearchEngagementService,
  ],
  exports: [
    ContentService,
    MarkdownRendererService,
    RichTextRendererService,
    ArticleMediaService,
  ],
})
export class ContentModule {}
