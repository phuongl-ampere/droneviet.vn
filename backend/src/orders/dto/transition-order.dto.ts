import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "../order-workflow";

export class TransitionOrderDto {
  @IsEnum(OrderStatus)
  nextStatus!: OrderStatus;

  @IsOptional()
  @IsString()
  refundReference?: string;
}
