import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, ObjectiveType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Tiêu đề bài học',
    example: 'Bài 1: Giới thiệu bản thân',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Slug của bài học',
    example: 'bai-1-gioi-thieu-ban-than',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Nội dung bài học',
    example:
      '## Mục tiêu\n\nSau bài học này, bạn sẽ biết cách giới thiệu bản thân...',
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
    description: 'ID của Topic',
    example: 'uuid-topic-id',
  })
  @IsUUID()
  @IsNotEmpty()
  topicId: string;

  @ApiPropertyOptional({
    description: 'Mô tả bài học',
    example: 'Học cách giới thiệu bản thân trong tiếng Anh',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL hình ảnh',
    example: 'https://example.com/images/lesson1.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Độ khó',
    enum: Difficulty,
    example: Difficulty.BEGINNER,
  })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Mục tiêu học tập',
    enum: ObjectiveType,
    isArray: true,
    example: [ObjectiveType.LEARN_VOCABULARY, ObjectiveType.LEARN_GRAMMAR],
  })
  @IsArray()
  @IsEnum(ObjectiveType, { each: true })
  @IsOptional()
  objectives?: ObjectiveType[];

  @ApiPropertyOptional({
    description: 'Trạng thái',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
