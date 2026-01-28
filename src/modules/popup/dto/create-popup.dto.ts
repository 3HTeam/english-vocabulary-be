import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePopupDto {
  @ApiProperty({
    description: 'Tiêu đề popup',
    example: 'Popup thông báo',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'URL hình ảnh',
    example: 'https://example.com/popup.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Mô tả popup',
    example: 'Popup thông báo sự kiện',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái popup',
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
