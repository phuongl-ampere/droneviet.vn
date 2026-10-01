import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import {
  OrderFulfillmentMethod,
  OrderPaymentMethod,
} from "../entities/order.entity";

export class CreateOrderLineDto {
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  courseSessionId?: string;

  @IsString()
  variantId!: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsString()
  contactName!: string;

  @IsPhoneNumber("VN")
  contactPhone!: string;

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderLineDto)
  lines!: CreateOrderLineDto[];

  @IsEnum(OrderPaymentMethod)
  paymentMethod!: OrderPaymentMethod;

  @IsOptional()
  @IsString()
  promotionCode?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsEnum(OrderFulfillmentMethod)
  fulfillmentMethod?: OrderFulfillmentMethod;

  @IsOptional()
  @IsString()
  shippingNote?: string;
}
