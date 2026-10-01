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
import { ContentRevision } from "./content-revision.entity";
import {
  ArticleEditorMode,
  ArticleSection,
} from "./article-editor-mode";

export enum ContentStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  SCHEDULED = "scheduled",
}

export { ArticleEditorMode, ArticleSection } from "./article-editor-mode";

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ default: "vi" })
  locale!: string;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  summary!: string | null;

  @Column({ type: "longtext" })
  bodyMarkdown!: string;

  @Column({ type: "json", nullable: true })
  bodyJson!: Record<string, unknown> | null;

  @Column({ type: "longtext", nullable: true })
  renderedHtml!: string | null;

  @Column({ type: "json", nullable: true })
  tableOfContents!: Array<{ depth: number; id: string; text: string }> | null;

  @Column({ type: "varchar", nullable: true })
  coverImageUrl!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  coverImageAlt!: string | null;

  @Column({ type: "json", nullable: true })
  tags!: string[] | null;

  @Column({ type: "enum", enum: ArticleSection, default: ArticleSection.NEWS })
  section!: ArticleSection;

  @Column({
    type: "enum",
    enum: ArticleEditorMode,
    default: ArticleEditorMode.MARKDOWN,
  })
  editorMode!: ArticleEditorMode;

  @Column({ type: "varchar", length: 36, nullable: true })
  authorId!: string | null;

  @Column({ type: "int", unsigned: true, default: 1 })
  readingTimeMinutes!: number;

  @Column({ type: "varchar", nullable: true })
  seoTitle!: string | null;

  @Column({ type: "text", nullable: true })
  seoDescription!: string | null;

  @Column({ type: "enum", enum: ContentStatus, default: ContentStatus.DRAFT })
  status!: ContentStatus;

  @Column({ type: "int", default: 0 })
  revisionNumber!: number;

  @Column({ type: "timestamp", nullable: true })
  publishedAt!: Date | null;

  @OneToMany(() => ContentRevision, (revision) => revision.article)
  revisions!: ContentRevision[];

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "authorId" })
  author!: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
