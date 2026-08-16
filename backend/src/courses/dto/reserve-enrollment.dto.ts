import { IsEmail, IsInt, IsOptional, IsPhoneNumber, IsString, Min } from "class-validator";

export class ReserveEnrollmentDto {
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsString()
  contactName!: string;

  @IsPhoneNumber("VN")
  contactPhone!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  sessionId!: string;
}
