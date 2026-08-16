import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContentService } from "./content.service";
import { MarkdownRendererService } from "./markdown-renderer.service";
import { Article } from "./entities/article.entity";
import { ContentRevision } from "./entities/content-revision.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Article, ContentRevision])],
  providers: [ContentService, MarkdownRendererService],
  exports: [ContentService, MarkdownRendererService],
})
export class ContentModule {}
