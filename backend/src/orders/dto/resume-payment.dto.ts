import { IsOptional, IsPhoneNumber } from "class-validator";

export class ResumePaymentDto {
  @IsOptional()
  @IsPhoneNumber("VN")
  phone?: string;
}
