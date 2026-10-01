import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { ArticleComment } from "./article-comment.entity";

@Entity("article_comment_reports")
@Unique("UQ_article_comment_reports_comment_reporter", ["commentId", "reporterId"])
export class ArticleCommentReport {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  commentId!: string;

  @Column({ type: "varchar", length: 36 })
  reporterId!: string;

  @Column({ type: "varchar", length: 500 })
  reason!: string;

  @ManyToOne(() => ArticleComment, (comment) => comment.reports, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "commentId" })
  comment!: ArticleComment;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "reporterId" })
  reporter!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
