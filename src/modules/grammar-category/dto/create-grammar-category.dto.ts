import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGrammarCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục ngữ pháp',
    example: 'Thì hiện tại',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Slug của danh mục',
    example: 'thi-hien-tai',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'URL hình ảnh',
    example: 'https://example.com/image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Mô tả danh mục',
    example: 'Danh mục các thì hiện tại trong tiếng Anh',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái danh mục',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
