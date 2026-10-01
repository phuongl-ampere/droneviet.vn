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

export class CreateArticleDraftDto {
  @IsOptional()
  @IsString()
  bodyMarkdown?: string;

  @IsOptional()
  @IsObject()
  bodyJson?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  coverImageAlt?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsEnum(ArticleEditorMode)
  editorMode?: ArticleEditorMode;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsEnum(ArticleSection)
  section?: ArticleSection;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  title!: string;
}
