import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateGrammarTopicDto {
  @ApiProperty({
    description: 'Tiêu đề chủ đề ngữ pháp',
    example: 'Thì hiện tại đơn',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Slug của chủ đề',
    example: 'thi-hien-tai-don',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Nội dung chủ đề ngữ pháp',
    example: 'Thì hiện tại đơn dùng để diễn tả...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID của Level',
    example: 'uuid-level-id',
  })
  @IsUUID()
  @IsNotEmpty()
  levelId: string;

  @ApiProperty({
    description: 'ID của danh mục ngữ pháp',
    example: 'uuid-grammar-category-id',
  })
  @IsUUID()
  @IsNotEmpty()
  grammarCategoryId: string;

  @ApiPropertyOptional({
    description: 'URL hình ảnh',
    example: 'https://example.com/image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Mô tả chủ đề',
    example: 'Mô tả chi tiết về thì hiện tại đơn',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Độ khó',
    enum: Difficulty,
    example: Difficulty.BEGINNER,
  })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiPropertyOptional({
    description: 'Trạng thái',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
