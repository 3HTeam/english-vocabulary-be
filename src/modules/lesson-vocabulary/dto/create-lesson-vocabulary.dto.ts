import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLessonVocabularyDto {
  @ApiProperty({
    description: 'ID của bài học',
    example: 'uuid-lesson-id',
  })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({
    description: 'ID của từ vựng',
    example: 'uuid-vocabulary-id',
  })
  @IsUUID()
  @IsNotEmpty()
  vocabularyId: string;

  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Đánh dấu là từ khóa chính',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isKey?: boolean;

  @ApiPropertyOptional({
    description: 'Ghi chú',
    example: 'Từ quan trọng trong bài',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
