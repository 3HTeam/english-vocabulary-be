import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLessonGrammarDto {
  @ApiProperty({
    description: 'ID của bài học',
    example: 'uuid-lesson-id',
  })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({
    description: 'ID của chủ đề ngữ pháp',
    example: 'uuid-grammar-topic-id',
  })
  @IsUUID()
  @IsNotEmpty()
  grammarTopicId: string;

  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Đánh dấu là ngữ pháp chính',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isMain?: boolean;

  @ApiPropertyOptional({
    description: 'Ghi chú',
    example: 'Ngữ pháp quan trọng trong bài',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
