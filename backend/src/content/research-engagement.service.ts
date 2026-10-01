import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AuditService } from "../audit/audit.service";
import { ArticleComment } from "./entities/article-comment.entity";
import { ArticleCommentReport } from "./entities/article-comment-report.entity";
import {
  Article,
  ArticleSection,
  ContentStatus,
} from "./entities/article.entity";
import { ArticleRating } from "./entities/article-rating.entity";

type RatingAggregate = {
  average: number;
  count: number;
  mine: number | null;
};

@Injectable()
export class ResearchEngagementService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  async getRating(
    articleId: string,
    userId?: string,
  ): Promise<RatingAggregate> {
    const ratings = await this.dataSource.getRepository(ArticleRating).find({
      where: { articleId },
    });
    const count = ratings.length;

    return {
      average: count
        ? Number(
            (
              ratings.reduce((total, rating) => total + rating.score, 0) / count
            ).toFixed(2),
          )
        : 0,
      count,
      mine: ratings.find((rating) => rating.userId === userId)?.score ?? null,
    };
  }

  async rate(slug: string, userId: string, score: number) {
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      throw new BadRequestException("ARTICLE_RATING_INVALID");
    }

    const article = await this.findPublishedResearch(slug);
    const repository = this.dataSource.getRepository(ArticleRating);
    await repository.upsert(
      { articleId: article.id, score, userId },
      ["articleId", "userId"],
    );

    return this.getRating(article.id, userId);
  }

  async removeRating(slug: string, userId: string) {
    const article = await this.findPublishedResearch(slug);
    await this.dataSource.getRepository(ArticleRating).delete({
      articleId: article.id,
      userId,
    });

    return this.getRating(article.id, userId);
  }

  async createComment(
    slug: string,
    userId: string,
    input: { body: string },
  ): Promise<ArticleComment> {
    const body = input.body.trim();

    if (body.length < 2 || body.length > 2000) {
      throw new BadRequestException("ARTICLE_COMMENT_INVALID");
    }

    const article = await this.findPublishedResearch(slug);
    const repository = this.dataSource.getRepository(ArticleComment);

    return repository.save(
      repository.create({
        articleId: article.id,
        authorId: userId,
        body,
        visible: true,
      }),
    );
  }

  async updateComment(
    commentId: string,
    userId: string,
    input: { body: string },
  ): Promise<ArticleComment> {
    const body = input.body.trim();

    if (body.length < 2 || body.length > 2000) {
      throw new BadRequestException("ARTICLE_COMMENT_INVALID");
    }

    const repository = this.dataSource.getRepository(ArticleComment);
    const comment = await repository.findOneByOrFail({ id: commentId });

    if (comment.authorId !== userId || !comment.visible) {
      throw new ForbiddenException("ARTICLE_COMMENT_EDIT_FORBIDDEN");
    }

    comment.body = body;

    return repository.save(comment);
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const repository = this.dataSource.getRepository(ArticleComment);
    const comment = await repository.findOneByOrFail({ id: commentId });

    if (comment.authorId !== userId) {
      throw new ForbiddenException("ARTICLE_COMMENT_DELETE_FORBIDDEN");
    }

    await repository.delete({ id: commentId });
  }

  async reportComment(
    commentId: string,
    userId: string,
    input: { reason: string },
  ): Promise<{ reported: true }> {
    const reason = input.reason.trim();

    if (reason.length < 2 || reason.length > 500) {
      throw new BadRequestException("ARTICLE_COMMENT_REPORT_INVALID");
    }

    const comment = await this.dataSource
      .getRepository(ArticleComment)
      .findOneByOrFail({ id: commentId });

    if (!comment.visible) {
      throw new NotFoundException("ARTICLE_COMMENT_NOT_FOUND");
    }

    await this.dataSource.getRepository(ArticleCommentReport).upsert(
      { commentId, reason, reporterId: userId },
      ["commentId", "reporterId"],
    );

    return { reported: true };
  }

  async listComments(slug: string) {
    const article = await this.findPublishedResearch(slug);

    return this.dataSource.getRepository(ArticleComment).find({
      order: { createdAt: "DESC" },
      relations: { author: true },
      where: { articleId: article.id, visible: true },
    });
  }

  async countVisibleComments(articleId: string): Promise<number> {
    return this.dataSource.getRepository(ArticleComment).count({
      where: { articleId, visible: true },
    });
  }

  async listReportedComments() {
    return this.dataSource.getRepository(ArticleCommentReport).find({
      order: { createdAt: "DESC" },
      relations: { comment: { article: true, author: true }, reporter: true },
    });
  }

  async hideComment(commentId: string, actorId?: string): Promise<ArticleComment> {
    return this.setCommentVisibility(commentId, false, actorId, "hidden");
  }

  async restoreComment(
    commentId: string,
    actorId?: string,
  ): Promise<ArticleComment> {
    return this.setCommentVisibility(commentId, true, actorId, "restored");
  }

  private async setCommentVisibility(
    commentId: string,
    visible: boolean,
    actorId: string | undefined,
    action: "hidden" | "restored",
  ): Promise<ArticleComment> {
    const repository = this.dataSource.getRepository(ArticleComment);
    const comment = await repository.findOneByOrFail({ id: commentId });
    comment.visible = visible;
    const saved = await repository.save(comment);

    await this.auditService.record({
      action: `content.comment.${action}`,
      actorId,
      aggregateId: comment.id,
      aggregateType: "article_comment",
      nextState: { visible },
    });

    return saved;
  }

  private async findPublishedResearch(slug: string): Promise<Article> {
    try {
      return await this.dataSource.getRepository(Article).findOneByOrFail({
        section: ArticleSection.RESEARCH,
        slug,
        status: ContentStatus.PUBLISHED,
      });
    } catch {
      throw new NotFoundException("RESEARCH_ARTICLE_NOT_FOUND");
    }
  }
}
