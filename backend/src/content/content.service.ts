import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { MarkdownRendererService } from "./markdown-renderer.service";
import { Article, ContentStatus } from "./entities/article.entity";
import { ContentRevision } from "./entities/content-revision.entity";
import { ProductContent } from "./entities/product-content.entity";

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

export interface PublishProductContentInput {
  bodyMarkdown: string;
  locale?: string;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly markdownRenderer: MarkdownRendererService,
  ) {}

  async createArticle(input: CreateArticleInput): Promise<Article> {
    return this.dataSource.transaction(async (manager) => {
      const articleRepository = manager.getRepository(Article);

      return articleRepository.save(
        articleRepository.create({
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
    });
  }

  async publishArticle(
    articleId: string,
    input: PublishArticleInput,
  ): Promise<Article> {
    const rendered = await this.markdownRenderer.render(input.bodyMarkdown);
    return this.dataSource.transaction(async (manager) => {
      const articleRepository = manager.getRepository(Article);
      const revisionRepository = manager.getRepository(ContentRevision);
      const article = await articleRepository.findOneByOrFail({ id: articleId });
      const revisionNumber = article.revisionNumber + 1;
      const metadata = {
        seoDescription: input.seoDescription ?? null,
        seoTitle: input.seoTitle ?? null,
        summary: input.summary ?? null,
        title: input.title,
      };
      const published = await articleRepository.save(
        Object.assign(article, {
        bodyMarkdown: input.bodyMarkdown,
        publishedAt: new Date(),
        renderedHtml: rendered.html,
        revisionNumber,
        seoDescription: metadata.seoDescription,
        seoTitle: metadata.seoTitle,
        status: ContentStatus.PUBLISHED,
        summary: metadata.summary,
        tableOfContents: rendered.tableOfContents,
        title: metadata.title,
        }),
      );

      await revisionRepository.save(
        revisionRepository.create({
        articleId: article.id,
        bodyMarkdown: input.bodyMarkdown,
        metadata,
        renderedHtml: rendered.html,
        revisionNumber,
        tableOfContents: rendered.tableOfContents,
        }),
      );

      return published;
    });
  }

  async publishProductContent(
    productId: string,
    input: PublishProductContentInput,
  ): Promise<ProductContent> {
    const rendered = await this.markdownRenderer.render(input.bodyMarkdown);

    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(ProductContent);
      const locale = input.locale ?? "vi";
      const existing = await repository.findOneBy({ productId, locale });
      const content = existing ?? repository.create({ productId, locale });

      return repository.save(
        Object.assign(content, {
          bodyMarkdown: input.bodyMarkdown,
          renderedHtml: rendered.html,
          tableOfContents: rendered.tableOfContents,
        }),
      );
    });
  }
}
