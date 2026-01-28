import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOnboardingDto {
  @ApiProperty({
    description: 'Tiêu đề onboarding',
    example: 'Chào mừng đến với ứng dụng',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'URL hình ảnh',
    example: 'https://example.com/onboarding.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Mô tả onboarding',
    example: 'Học từ vựng tiếng Anh mỗi ngày',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái onboarding',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
