import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./article.entity";
import { ArticleEditorMode } from "./article-editor-mode";

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

  @Column({ type: "json", nullable: true })
  bodyJson!: Record<string, unknown> | null;

  @Column({
    type: "enum",
    enum: ArticleEditorMode,
    default: ArticleEditorMode.MARKDOWN,
  })
  editorMode!: ArticleEditorMode;

  @Column({ type: "longtext" })
  renderedHtml!: string;

  @Column({ type: "json" })
  tableOfContents!: Array<{ depth: number; id: string; text: string }>;

  @Column({ type: "json" })
  metadata!: {
    coverImageAlt: string | null;
    coverImageUrl: string | null;
    readingTimeMinutes: number;
    section: string;
    seoDescription: string | null;
    seoTitle: string | null;
    summary: string | null;
    tags: string[];
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
