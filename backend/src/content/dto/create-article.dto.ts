import { IsOptional, IsString } from "class-validator";

export class CreateArticleDto {
  @IsString()
  bodyMarkdown!: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

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
  @IsString()
  summary?: string;

  @IsString()
  slug!: string;

  @IsString()
  title!: string;
}
