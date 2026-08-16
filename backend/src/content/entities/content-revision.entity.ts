import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./article.entity";

@Entity("content_revisions")
export class ContentRevision {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  articleId!: string;

  @Column({ type: "int" })
  revisionNumber!: number;

  @Column({ type: "longtext" })
  bodyMarkdown!: string;

  @Column({ type: "longtext" })
  renderedHtml!: string;

  @Column({ type: "json" })
  tableOfContents!: Array<{ depth: number; id: string; text: string }>;

  @Column({ type: "json" })
  metadata!: {
    seoDescription: string | null;
    seoTitle: string | null;
    summary: string | null;
    title: string;
  };

  @ManyToOne(() => Article, (article) => article.revisions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "articleId" })
  article!: Article;

  @CreateDateColumn()
  createdAt!: Date;
}
