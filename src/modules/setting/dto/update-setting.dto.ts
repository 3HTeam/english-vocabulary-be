import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @ApiPropertyOptional({
    description: 'Tên ứng dụng',
    example: 'English Vocabulary',
  })
  @IsOptional()
  @IsString()
  appName?: string;

  @ApiPropertyOptional({ description: 'Mô tả ứng dụng' })
  @IsOptional()
  @IsString()
  appDescription?: string;

  @ApiPropertyOptional({
    description: 'URL logo',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'URL favicon',
    example: 'https://example.com/favicon.ico',
  })
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @ApiPropertyOptional({ description: 'Màu chính', example: '#3B82F6' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Email liên hệ',
    example: 'contact@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Link Facebook' })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({ description: 'Link Twitter' })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({ description: 'Link Instagram' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ description: 'Link Youtube' })
  @IsOptional()
  @IsString()
  youtube?: string;

  @ApiPropertyOptional({ description: 'Link TikTok' })
  @IsOptional()
  @IsString()
  tiktok?: string;
}
