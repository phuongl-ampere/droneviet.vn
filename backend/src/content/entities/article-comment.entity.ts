import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Article } from "./article.entity";
import { ArticleCommentReport } from "./article-comment-report.entity";

@Entity("article_comments")
export class ArticleComment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  articleId!: string;

  @Column({ type: "varchar", length: 36 })
  authorId!: string;

  @Column({ type: "varchar", length: 2000 })
  body!: string;

  @Column({ default: true })
  visible!: boolean;

  @ManyToOne(() => Article, { onDelete: "CASCADE" })
  @JoinColumn({ name: "articleId" })
  article!: Article;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "authorId" })
  author!: User;

  @OneToMany(() => ArticleCommentReport, (report) => report.comment)
  reports!: ArticleCommentReport[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
