import { IsOptional, IsString } from "class-validator";

export class PublishArticleDto {
  @IsString()
  bodyMarkdown!: string;

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
  title!: string;
}
