import { IsString, Length } from "class-validator";

export class CreateArticleCommentDto {
  @IsString()
  @Length(2, 2000)
  body!: string;
}
