import { IsInt, IsString, Min } from "class-validator";

export class EstimateShippingDto {
  @IsInt()
  @Min(0)
  productPriceVnd!: number;

  @IsString()
  receiverProvince!: string;

  @IsInt()
  @Min(1)
  weightG!: number;
}
