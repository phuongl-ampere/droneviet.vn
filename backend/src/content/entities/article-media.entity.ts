import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Article } from "./article.entity";

@Entity("article_media")
export class ArticleMedia {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36, nullable: true })
  articleId!: string | null;

  @Column({ type: "varchar", length: 36 })
  uploaderId!: string;

  @Column({ unique: true })
  storageKey!: string;

  @Column({ length: 255, unique: true })
  publicUrl!: string;

  @Column({ type: "varchar", length: 255 })
  altText!: string;

  @Column({ type: "varchar", length: 128 })
  originalMime!: string;

  @Column({ type: "int", unsigned: true })
  width!: number;

  @Column({ type: "int", unsigned: true })
  height!: number;

  @Column({ type: "int", unsigned: true })
  bytes!: number;

  @Column({ type: "json", nullable: true })
  variants!: Record<string, string> | null;

  @ManyToOne(() => Article, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "articleId" })
  article!: Article | null;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "uploaderId" })
  uploader!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
