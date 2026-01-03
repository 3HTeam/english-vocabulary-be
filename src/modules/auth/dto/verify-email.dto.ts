import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Địa chỉ email cần xác thực',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @ApiPropertyOptional({
    description: 'Mã OTP xác thực',
    example: '123456',
  })
  @IsString({ message: 'OTP phải là chuỗi' })
  @IsOptional()
  otp?: string;

  @ApiPropertyOptional({
    description: 'Token xác thực',
    example: 'abc123xyz...',
  })
  @IsString({ message: 'Token phải là chuỗi' })
  @IsOptional()
  token?: string;
}
