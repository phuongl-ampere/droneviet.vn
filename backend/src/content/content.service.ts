import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MarkdownRendererService } from "./markdown-renderer.service";
import { Article, ContentStatus } from "./entities/article.entity";
import { ContentRevision } from "./entities/content-revision.entity";

export interface PublishArticleInput {
  bodyMarkdown: string;
  seoDescription?: string;
  seoTitle?: string;
  summary?: string;
  title: string;
}

export interface CreateArticleInput extends PublishArticleInput {
  coverImageUrl?: string;
  locale?: string;
  slug: string;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ContentRevision)
    private readonly revisionRepository: Repository<ContentRevision>,
    private readonly markdownRenderer: MarkdownRendererService,
  ) {}

  async createArticle(input: CreateArticleInput): Promise<Article> {
    return this.articleRepository.save(
      this.articleRepository.create({
        bodyMarkdown: input.bodyMarkdown,
        coverImageUrl: input.coverImageUrl ?? null,
        locale: input.locale ?? "vi",
        renderedHtml: null,
        revisionNumber: 0,
        seoDescription: input.seoDescription ?? null,
        seoTitle: input.seoTitle ?? null,
        slug: input.slug,
        status: ContentStatus.DRAFT,
        summary: input.summary ?? null,
        tableOfContents: null,
        title: input.title,
      }),
    );
  }

  async publishArticle(
    articleId: string,
    input: PublishArticleInput,
  ): Promise<Article> {
    const article = await this.articleRepository.findOneByOrFail({
      id: articleId,
    });
    const rendered = await this.markdownRenderer.render(input.bodyMarkdown);
    const revisionNumber = article.revisionNumber + 1;

    const published = await this.articleRepository.save(
      Object.assign(article, {
        bodyMarkdown: input.bodyMarkdown,
        publishedAt: new Date(),
        renderedHtml: rendered.html,
        revisionNumber,
        seoDescription: input.seoDescription ?? null,
        seoTitle: input.seoTitle ?? null,
        status: ContentStatus.PUBLISHED,
        summary: input.summary ?? null,
        tableOfContents: rendered.tableOfContents,
        title: input.title,
      }),
    );

    await this.revisionRepository.save(
      this.revisionRepository.create({
        articleId: article.id,
        bodyMarkdown: input.bodyMarkdown,
        renderedHtml: rendered.html,
        revisionNumber,
        tableOfContents: rendered.tableOfContents,
      }),
    );

    return published;
  }
}
