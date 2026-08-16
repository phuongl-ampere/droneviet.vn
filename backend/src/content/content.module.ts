import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AdminContentController } from "./admin-content.controller";
import { ContentService } from "./content.service";
import { MarkdownRendererService } from "./markdown-renderer.service";
import { Article } from "./entities/article.entity";
import { ContentRevision } from "./entities/content-revision.entity";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Article, ContentRevision])],
  controllers: [AdminContentController],
  providers: [ContentService, MarkdownRendererService],
  exports: [ContentService, MarkdownRendererService],
})
export class ContentModule {}
