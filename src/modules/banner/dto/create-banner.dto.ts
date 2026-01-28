import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({
    description: 'Tiêu đề banner',
    example: 'Banner chào mừng',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'URL hình ảnh',
    example: 'https://example.com/banner.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Mô tả banner',
    example: 'Banner chào mừng người dùng mới',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái banner',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    description: 'ID của module',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  moduleId: string;
}
