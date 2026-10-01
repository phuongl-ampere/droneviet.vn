import { IsString, Length } from "class-validator";

export class ReportArticleCommentDto {
  @IsString()
  @Length(2, 500)
  reason!: string;
}
