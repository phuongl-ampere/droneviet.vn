import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import {
  ArticleEditorMode,
  ArticleSection,
} from "../entities/article.entity";

export class UpdateArticleDraftDto {
  @IsOptional()
  @IsString()
  bodyMarkdown?: string;

  @IsOptional()
  @IsObject()
  bodyJson?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  coverImageAlt?: string | null;

  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;

  @IsOptional()
  @IsEnum(ArticleEditorMode)
  editorMode?: ArticleEditorMode;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @IsOptional()
  @IsEnum(ArticleSection)
  section?: ArticleSection;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  summary?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  title?: string;
}
