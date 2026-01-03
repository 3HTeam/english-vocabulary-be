import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLessonExerciseDto {
  @ApiProperty({
    description: 'Tiêu đề bài tập',
    example: 'Điền từ còn thiếu',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Loại bài tập',
    enum: ExerciseType,
    example: ExerciseType.FILL_BLANK,
  })
  @IsEnum(ExerciseType)
  @IsNotEmpty()
  type: ExerciseType;

  @ApiProperty({
    description: 'Câu hỏi',
    example: 'I ___ a student.',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Đáp án đúng',
    example: 'am',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'ID của bài học',
    example: 'uuid-lesson-id',
  })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({
    description: 'Điểm số',
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  score: number;

  @ApiPropertyOptional({
    description: 'Các lựa chọn (cho câu hỏi trắc nghiệm)',
    example: { options: ['am', 'is', 'are', 'be'] },
  })
  @IsObject()
  @IsOptional()
  options?: object;

  @ApiPropertyOptional({
    description: 'Giải thích đáp án',
    example: 'Dùng "am" với chủ ngữ "I"',
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Đánh dấu là bài tập quan trọng',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isKey?: boolean;

  @ApiPropertyOptional({
    description: 'Ghi chú',
    example: 'Bài tập quan trọng',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
