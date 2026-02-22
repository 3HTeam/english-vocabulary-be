import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ExamType, ScoreType, SectionType } from "@prisma/client";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// ==================== Exam Section DTOs ====================

export class CreateExamSectionDto {
  @ApiProperty({ description: "Tên phần thi", example: "Listening" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Loại phần thi",
    enum: SectionType,
    example: SectionType.LISTENING,
  })
  @IsEnum(SectionType)
  @IsNotEmpty()
  sectionType: SectionType;

  @ApiProperty({ description: "Thứ tự", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiPropertyOptional({ description: "Thời gian (phút)", example: 45 })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ description: "Tổng số câu hỏi", example: 100 })
  @IsNumber()
  @IsNotEmpty()
  totalQuestions: number;

  @ApiProperty({ description: "Điểm tối đa", example: 495 })
  @IsNumber()
  @IsNotEmpty()
  maxScore: number;
}

// ==================== Exam DTOs ====================

export class CreateExamDto {
  @ApiProperty({ description: "Tên đề thi", example: "TOEIC Practice Test #1" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: "Mô tả" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: "URL hình ảnh" })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: "Loại đề thi",
    enum: ExamType,
    example: ExamType.TOEIC,
  })
  @IsEnum(ExamType)
  @IsNotEmpty()
  examType: ExamType;

  @ApiProperty({ description: "Thời gian làm bài (phút)", example: 120 })
  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @ApiProperty({ description: "Tổng số câu hỏi", example: 200 })
  @IsNumber()
  @IsNotEmpty()
  totalQuestions: number;

  @ApiProperty({
    description: "Điểm tối đa (TOEIC: 990, IELTS: 9)",
    example: 990,
  })
  @IsNumber()
  @IsNotEmpty()
  maxScore: number;

  @ApiProperty({
    description: "Loại thang điểm",
    enum: ScoreType,
    example: ScoreType.NUMERIC,
  })
  @IsEnum(ScoreType)
  @IsNotEmpty()
  scoreType: ScoreType;

  @ApiProperty({ description: "ID cấp độ", example: "uuid-level-id" })
  @IsUUID()
  @IsNotEmpty()
  levelId: string;

  @ApiPropertyOptional({
    description: "Danh sách phần thi (tạo cùng lúc)",
    type: [CreateExamSectionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExamSectionDto)
  @IsOptional()
  sections?: CreateExamSectionDto[];

  @ApiPropertyOptional({ description: "Trạng thái", example: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

// ==================== Exam Question DTOs ====================

export class AddExamQuestionsDto {
  @ApiProperty({
    description: "Danh sách câu hỏi cần thêm vào section",
    type: "array",
    items: {
      type: "object",
      properties: {
        exerciseId: {
          type: "string",
          description: "ID bài tập từ ngân hàng câu hỏi",
        },
        order: { type: "number", description: "Thứ tự câu trong section" },
      },
    },
    example: [
      { exerciseId: "uuid-exercise-1", order: 1 },
      { exerciseId: "uuid-exercise-2", order: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionItemDto)
  questions: ExamQuestionItemDto[];
}

export class ExamQuestionItemDto {
  @ApiProperty({ description: "ID bài tập" })
  @IsUUID()
  @IsNotEmpty()
  exerciseId: string;

  @ApiProperty({ description: "Thứ tự câu trong section", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  order: number;
}
