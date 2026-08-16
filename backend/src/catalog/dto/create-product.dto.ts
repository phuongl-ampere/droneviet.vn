import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { PurchaseMode } from "../entities/product-variant.entity";
import { ProductKind } from "../entities/product.entity";

export class CreateProductVariantDto {
  @IsInt()
  @Min(0)
  priceVnd!: number;

  @IsInt()
  @Min(0)
  stockOnHand!: number;

  @IsEnum(PurchaseMode)
  purchaseMode!: PurchaseMode;

  @IsString()
  sku!: string;

  @IsString()
  title!: string;
}

export class CreateProductDto {
  @IsEnum(ProductKind)
  kind!: ProductKind;

  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  summary!: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[];
}
