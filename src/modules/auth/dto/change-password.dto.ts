import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu cũ',
    example: 'oldpassword123',
  })
  @IsString({ message: 'Mật khẩu cũ phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu cũ là bắt buộc' })
  oldPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới (tối thiểu 6 ký tự)',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu mới là bắt buộc' })
  newPassword: string;
}
