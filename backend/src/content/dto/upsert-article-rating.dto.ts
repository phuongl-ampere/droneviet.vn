import { IsInt, Max, Min } from "class-validator";

export class UpsertArticleRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;
}
