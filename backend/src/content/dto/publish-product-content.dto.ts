import { IsOptional, IsString } from "class-validator";

export class PublishProductContentDto {
  @IsString()
  bodyMarkdown!: string;

  @IsOptional()
  @IsString()
  locale?: string;
}
