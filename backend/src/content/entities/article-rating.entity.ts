import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Article } from "./article.entity";

@Entity("article_ratings")
@Unique("UQ_article_ratings_article_user", ["articleId", "userId"])
@Check("CHK_article_ratings_score", "`score` >= 1 AND `score` <= 5")
export class ArticleRating {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  articleId!: string;

  @Column({ type: "varchar", length: 36 })
  userId!: string;

  @Column({ type: "tinyint", unsigned: true })
  score!: number;

  @ManyToOne(() => Article, { onDelete: "CASCADE" })
  @JoinColumn({ name: "articleId" })
  article!: Article;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
