import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    description: 'Tên module',
    example: 'Home',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả module',
    example: 'Module trang chủ',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái module',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
