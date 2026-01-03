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

export class CreateGrammarExerciseDto {
  @ApiProperty({
    description: 'Loại bài tập',
    enum: ExerciseType,
    example: ExerciseType.MULTIPLE_CHOICE,
  })
  @IsEnum(ExerciseType)
  @IsNotEmpty()
  type: ExerciseType;

  @ApiProperty({
    description: 'Câu hỏi',
    example: 'She ___ to school every day.',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Đáp án đúng',
    example: 'goes',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'ID của chủ đề ngữ pháp',
    example: 'uuid-grammar-topic-id',
  })
  @IsUUID()
  @IsNotEmpty()
  grammarTopicId: string;

  @ApiProperty({
    description: 'Điểm số',
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  score: number;

  @ApiPropertyOptional({
    description: 'Các lựa chọn (cho câu hỏi trắc nghiệm)',
    example: { options: ['go', 'goes', 'going', 'went'] },
  })
  @IsObject()
  @IsOptional()
  options?: object;

  @ApiPropertyOptional({
    description: 'Giải thích đáp án',
    example: 'Sử dụng "goes" vì chủ ngữ "She" là ngôi thứ 3 số ít',
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
    description: 'Trạng thái',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
