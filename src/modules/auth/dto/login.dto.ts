import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Địa chỉ email',
    example: 'lamchoichoi5@gmail.com',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: '123456',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  password: string;
}
