import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager } from "typeorm";
import { AuditService } from "../audit/audit.service";
import {
  Article,
  ArticleEditorMode,
  ArticleSection,
  ContentStatus,
} from "./entities/article.entity";
import { ContentRevision } from "./entities/content-revision.entity";
import { ProductContent } from "./entities/product-content.entity";
import { MarkdownRendererService } from "./markdown-renderer.service";
import { RichTextRendererService } from "./rich-text-renderer.service";

const readingTime = require("reading-time") as (text: string) => {
  minutes: number;
};

export type ArticleSourceInput = {
  bodyJson?: Record<string, unknown> | null;
  bodyMarkdown?: string;
  editorMode?: ArticleEditorMode;
};

export type ArticleDraftInput = ArticleSourceInput & {
  coverImageAlt?: string | null;
  coverImageUrl?: string | null;
  locale?: string;
  seoDescription?: string | null;
  seoTitle?: string | null;
  section?: ArticleSection;
  slug?: string;
  summary?: string | null;
  tags?: string[];
  title?: string;
};

export interface PublishArticleInput extends ArticleDraftInput {
  title?: string;
}

export interface CreateArticleInput extends ArticleDraftInput {
  slug: string;
  title: string;
}

export interface PublishProductContentInput {
  bodyMarkdown: string;
  locale?: string;
}

function isRichTextDocumentEmpty(document: Record<string, unknown> | null | undefined): boolean {
  if (!document || typeof document !== "object") {
    return true;
  }

  const root = document.root;

  function hasContent(node: unknown): boolean {
    if (!node || typeof node !== "object") {
      return false;
    }

    const value = node as {
      children?: unknown[];
      text?: unknown;
      type?: unknown;
    };

    if (typeof value.text === "string" && value.text.trim()) {
      return true;
    }
    if (
      typeof value.type === "string" &&
      value.type !== "root" &&
      value.type !== "paragraph"
    ) {
      return true;
    }

    return value.children?.some(hasContent) ?? false;
  }

  return !hasContent(root);
}

function markdownText(markdown: string): string {
  return markdown
    .replace(/`{1,3}[^`]*`{1,3}/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_~`[\]()\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTags(tags: string[] | undefined): string[] {
  return [
    ...new Set(
      (tags ?? [])
        .map((tag) =>
          tag
            .normalize("NFKD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
            .replace(/(^-|-$)/g, ""),
        )
        .filter(Boolean),
    ),
  ];
}

function sourceHasContent(article: Pick<Article, "bodyJson" | "bodyMarkdown" | "editorMode">): boolean {
  return article.editorMode === ArticleEditorMode.MARKDOWN
    ? Boolean(article.bodyMarkdown?.trim())
    : !isRichTextDocumentEmpty(article.bodyJson);
}

@Injectable()
export class ContentService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly markdownRenderer: MarkdownRendererService,
    private readonly richTextRenderer: RichTextRendererService,
    private readonly auditService: AuditService,
  ) {}

  async createArticle(input: CreateArticleInput): Promise<Article> {
    return this.createArticleDraft(input);
  }

  async createArticleDraft(
    input: CreateArticleInput,
    actorId?: string,
  ): Promise<Article> {
    const editorMode = input.editorMode ?? ArticleEditorMode.MARKDOWN;
    this.assertInputMatchesMode(input, editorMode);

    const article = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Article);

      return repository.save(
        repository.create({
          authorId: actorId ?? null,
          bodyJson:
            editorMode === ArticleEditorMode.RICH_TEXT
              ? (input.bodyJson ?? null)
              : null,
          bodyMarkdown:
            editorMode === ArticleEditorMode.MARKDOWN
              ? (input.bodyMarkdown ?? "")
              : "",
          coverImageAlt: input.coverImageAlt?.trim() || null,
          coverImageUrl: input.coverImageUrl?.trim() || null,
          editorMode,
          locale: input.locale?.trim() || "vi",
          readingTimeMinutes: 1,
          renderedHtml: null,
          revisionNumber: 0,
          section: input.section ?? ArticleSection.NEWS,
          seoDescription: input.seoDescription?.trim() || null,
          seoTitle: input.seoTitle?.trim() || null,
          slug: input.slug.trim(),
          status: ContentStatus.DRAFT,
          summary: input.summary?.trim() || null,
          tableOfContents: null,
          tags: normalizeTags(input.tags),
          title: input.title.trim(),
        }),
      );
    });

    await this.auditService.record({
      action: "content.article.created",
      actorId,
      aggregateId: article.id,
      aggregateType: "article",
      nextState: {
        editorMode: article.editorMode,
        section: article.section,
        status: article.status,
      },
    });

    return article;
  }

  async listAdminArticles(filters: {
    locale?: string;
    section?: ArticleSection;
    status?: ContentStatus;
  } = {}): Promise<Article[]> {
    return this.dataSource.getRepository(Article).find({
      order: { updatedAt: "DESC" },
      where: {
        ...(filters.locale ? { locale: filters.locale } : {}),
        ...(filters.section ? { section: filters.section } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
    });
  }

  async getAdminArticle(articleId: string): Promise<Article> {
    return this.dataSource.getRepository(Article).findOneOrFail({
      order: { revisions: { revisionNumber: "DESC" } },
      relations: { revisions: true },
      where: { id: articleId },
    });
  }

  async listPublishedResearch(
    locale: string,
    cursor?: string,
  ): Promise<{ items: Article[]; nextCursor: string | null }> {
    const all = await this.dataSource.getRepository(Article).find({
      order: { publishedAt: "DESC", id: "DESC" },
      relations: { author: true },
      where: {
        locale,
        section: ArticleSection.RESEARCH,
        status: ContentStatus.PUBLISHED,
      },
    });
    const start = cursor ? Number(Buffer.from(cursor, "base64url").toString()) : 0;
    const offset = Number.isSafeInteger(start) && start >= 0 ? start : 0;
    const items = all.slice(offset, offset + 12);
    const nextCursor =
      offset + items.length < all.length
        ? Buffer.from(String(offset + items.length)).toString("base64url")
        : null;

    return { items, nextCursor };
  }

  async getPublishedResearch(slug: string, locale: string): Promise<Article> {
    return this.dataSource.getRepository(Article).findOneOrFail({
      relations: { author: true },
      where: {
        locale,
        section: ArticleSection.RESEARCH,
        slug,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  async updateArticleDraft(
    articleId: string,
    input: ArticleDraftInput,
    actorId?: string,
  ): Promise<Article> {
    const repository = this.dataSource.getRepository(Article);
    const article = await repository.findOneByOrFail({ id: articleId });
    const previousMode = article.editorMode ?? ArticleEditorMode.MARKDOWN;
    const nextMode = input.editorMode ?? previousMode;

    if (
      nextMode !== previousMode &&
      sourceHasContent({ ...article, editorMode: previousMode })
    ) {
      throw new ConflictException("editor mode is locked");
    }

    article.editorMode = previousMode;
    this.assertInputMatchesMode(input, nextMode);
    this.applyDraftInput(article, input, nextMode);
    const saved = await repository.save(article);

    await this.auditService.record({
      action: "content.article.draft_saved",
      actorId,
      aggregateId: saved.id,
      aggregateType: "article",
      nextState: {
        editorMode: saved.editorMode,
        status: saved.status,
      },
    });

    return saved;
  }

  async publishArticle(
    articleId: string,
    input: PublishArticleInput,
    actorId?: string,
  ): Promise<Article> {
    const published = await this.dataSource.transaction(async (manager) => {
      const articleRepository = manager.getRepository(Article);
      const revisionRepository = manager.getRepository(ContentRevision);
      const article = await articleRepository.findOneByOrFail({ id: articleId });
      const previousMode = article.editorMode ?? ArticleEditorMode.MARKDOWN;
      const nextMode = input.editorMode ?? previousMode;

      if (nextMode !== previousMode && sourceHasContent({
        ...article,
        editorMode: previousMode,
      })) {
        throw new ConflictException("editor mode is locked");
      }

      article.editorMode = previousMode;
      this.assertInputMatchesMode(input, nextMode);
      this.applyDraftInput(article, input, nextMode);

      if (!article.title.trim()) {
        throw new UnprocessableEntityException("Article title is required");
      }

      const rendered = await this.renderArticleSource(article);

      if (!rendered.text.trim()) {
        throw new UnprocessableEntityException("Article content is required");
      }

      const revisionNumber = article.revisionNumber + 1;
      const metadata = {
        coverImageAlt: article.coverImageAlt,
        coverImageUrl: article.coverImageUrl,
        readingTimeMinutes: Math.max(
          1,
          Math.ceil(readingTime(rendered.text).minutes),
        ),
        section: article.section,
        seoDescription: article.seoDescription,
        seoTitle: article.seoTitle,
        summary: article.summary,
        tags: article.tags ?? [],
        title: article.title,
      };
      const nextArticle = Object.assign(article, {
        publishedAt: new Date(),
        readingTimeMinutes: metadata.readingTimeMinutes,
        renderedHtml: rendered.html,
        revisionNumber,
        status: ContentStatus.PUBLISHED,
        tableOfContents: rendered.tableOfContents,
      });
      const saved = await articleRepository.save(nextArticle);

      await revisionRepository.save(
        revisionRepository.create({
          articleId: saved.id,
          bodyJson:
            saved.editorMode === ArticleEditorMode.RICH_TEXT
              ? saved.bodyJson
              : null,
          bodyMarkdown:
            saved.editorMode === ArticleEditorMode.MARKDOWN
              ? saved.bodyMarkdown
              : "",
          editorMode: saved.editorMode,
          metadata,
          renderedHtml: rendered.html,
          revisionNumber,
          tableOfContents: rendered.tableOfContents,
        }),
      );

      return saved;
    });

    await this.auditService.record({
      action: "content.article.published",
      actorId,
      aggregateId: published.id,
      aggregateType: "article",
      nextState: {
        revisionNumber: published.revisionNumber,
        status: published.status,
      },
    });

    return published;
  }

  async restoreArticleRevision(
    articleId: string,
    revisionNumber: number,
    actorId?: string,
  ): Promise<Article> {
    const restored = await this.dataSource.transaction(async (manager) => {
      const articleRepository = manager.getRepository(Article);
      const revisionRepository = manager.getRepository(ContentRevision);
      const [article, revision] = await Promise.all([
        articleRepository.findOneByOrFail({ id: articleId }),
        revisionRepository.findOneByOrFail({ articleId, revisionNumber }),
      ]);
      const metadata = revision.metadata ?? {
        coverImageAlt: null,
        coverImageUrl: null,
        readingTimeMinutes: 1,
        section: ArticleSection.NEWS,
        seoDescription: null,
        seoTitle: null,
        summary: null,
        tags: [],
        title: article.title,
      };

      return articleRepository.save(
        Object.assign(article, {
          bodyJson: revision.bodyJson,
          bodyMarkdown: revision.bodyMarkdown,
          coverImageAlt: metadata.coverImageAlt,
          coverImageUrl: metadata.coverImageUrl,
          editorMode: revision.editorMode,
          readingTimeMinutes: metadata.readingTimeMinutes,
          renderedHtml: null,
          section: metadata.section as ArticleSection,
          seoDescription: metadata.seoDescription,
          seoTitle: metadata.seoTitle,
          status: ContentStatus.DRAFT,
          summary: metadata.summary,
          tableOfContents: null,
          tags: metadata.tags,
          title: metadata.title,
        }),
      );
    });

    await this.auditService.record({
      action: "content.article.revision_restored",
      actorId,
      aggregateId: restored.id,
      aggregateType: "article",
      nextState: {
        revisionNumber,
        status: restored.status,
      },
    });

    return restored;
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

  private applyDraftInput(
    article: Article,
    input: ArticleDraftInput,
    editorMode: ArticleEditorMode,
  ) {
    article.editorMode = editorMode;

    if (editorMode === ArticleEditorMode.MARKDOWN) {
      if (input.bodyMarkdown !== undefined) {
        article.bodyMarkdown = input.bodyMarkdown;
      }
      article.bodyJson = null;
    } else {
      if (input.bodyJson !== undefined) {
        article.bodyJson = input.bodyJson;
      }
      article.bodyMarkdown = "";
    }

    if (input.coverImageAlt !== undefined) {
      article.coverImageAlt = input.coverImageAlt?.trim() || null;
    }
    if (input.coverImageUrl !== undefined) {
      article.coverImageUrl = input.coverImageUrl?.trim() || null;
    }
    if (input.locale !== undefined) {
      article.locale = input.locale.trim();
    }
    if (input.seoDescription !== undefined) {
      article.seoDescription = input.seoDescription?.trim() || null;
    }
    if (input.seoTitle !== undefined) {
      article.seoTitle = input.seoTitle?.trim() || null;
    }
    if (input.section !== undefined) {
      article.section = input.section;
    }
    if (input.slug !== undefined) {
      article.slug = input.slug.trim();
    }
    if (input.summary !== undefined) {
      article.summary = input.summary?.trim() || null;
    }
    if (input.tags !== undefined) {
      article.tags = normalizeTags(input.tags);
    }
    if (input.title !== undefined) {
      article.title = input.title.trim();
    }
  }

  private assertInputMatchesMode(
    input: ArticleSourceInput,
    editorMode: ArticleEditorMode,
  ) {
    if (
      editorMode === ArticleEditorMode.MARKDOWN &&
      input.bodyJson !== undefined
    ) {
      throw new BadRequestException(
        "Rich-text source cannot be saved in markdown mode",
      );
    }
    if (
      editorMode === ArticleEditorMode.RICH_TEXT &&
      input.bodyMarkdown !== undefined
    ) {
      throw new BadRequestException(
        "Markdown source cannot be saved in rich_text mode",
      );
    }
  }

  private async renderArticleSource(article: Article) {
    if (article.editorMode === ArticleEditorMode.MARKDOWN) {
      if (!article.bodyMarkdown.trim()) {
        throw new UnprocessableEntityException("Markdown content is required");
      }

      const rendered = await this.markdownRenderer.render(article.bodyMarkdown);

      return {
        html: rendered.html,
        tableOfContents: rendered.tableOfContents,
        text: markdownText(article.bodyMarkdown),
      };
    }

    if (isRichTextDocumentEmpty(article.bodyJson)) {
      throw new UnprocessableEntityException("Rich-text content is required");
    }

    return this.richTextRenderer.render(
      article.bodyJson as Record<string, unknown>,
    );
  }
}
