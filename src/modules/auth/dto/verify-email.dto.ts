import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @IsString({ message: 'OTP phải là chuỗi' })
  @IsOptional()
  otp?: string;

  @IsString({ message: 'Token phải là chuỗi' })
  @IsOptional()
  token?: string;
}
