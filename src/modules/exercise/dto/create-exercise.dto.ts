import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ExerciseType, ExerciseCategory } from "@prisma/client";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateExerciseOptionDto {
  @ApiProperty({
    description: "Nội dung đáp án",
    example: "goes",
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: "Đáp án đúng hay sai",
    example: true,
  })
  @IsBoolean()
  isCorrect: boolean;

  @ApiPropertyOptional({
    description: "Thứ tự hiển thị",
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: "Metadata bổ sung (matchWith cho MATCHING,...)",
    example: { matchWith: "mèo" },
  })
  @IsObject()
  @IsOptional()
  metadata?: object;
}

export class CreateExerciseDto {
  @ApiProperty({
    description: "Loại bài tập",
    enum: ExerciseType,
    example: ExerciseType.MULTIPLE_CHOICE,
  })
  @IsEnum(ExerciseType)
  @IsNotEmpty()
  type: ExerciseType;

  @ApiProperty({
    description: "Danh mục bài tập",
    enum: ExerciseCategory,
    example: ExerciseCategory.GRAMMAR,
  })
  @IsEnum(ExerciseCategory)
  @IsNotEmpty()
  category: ExerciseCategory;

  @ApiProperty({
    description: "Câu hỏi",
    example: "She ___ to school every day.",
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: "ID của cấp độ",
    example: "uuid-level-id",
  })
  @IsUUID()
  @IsNotEmpty()
  levelId: string;

  @ApiPropertyOptional({
    description: "ID của chủ đề ngữ pháp",
    example: "uuid-grammar-topic-id",
  })
  @IsUUID()
  @IsOptional()
  grammarTopicId?: string;

  @ApiPropertyOptional({
    description: "ID của chủ đề từ vựng",
    example: "uuid-topic-id",
  })
  @IsUUID()
  @IsOptional()
  topicId?: string;

  @ApiProperty({
    description: "Danh sách đáp án",
    type: [CreateExerciseOptionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseOptionDto)
  options: CreateExerciseOptionDto[];

  @ApiPropertyOptional({
    description: "Giải thích đáp án",
    example: 'Sử dụng "goes" vì chủ ngữ "She" là ngôi thứ 3 số ít',
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({
    description: "Script bài nghe (text thuần)",
    example: "Good morning. I'd like to check in please.",
  })
  @IsString()
  @IsOptional()
  transcript?: string;

  @ApiPropertyOptional({
    description: "Từ vựng + ngữ pháp mới trong bài (rich text HTML)",
    example: "<p><strong>take a beating</strong>: chịu thiệt hại</p>",
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: "Gợi ý cho người dùng",
    example: "Chủ ngữ là ngôi thứ 3 số ít",
  })
  @IsString()
  @IsOptional()
  hint?: string;

  @ApiPropertyOptional({
    description: "URL media (hình ảnh, audio, video)",
  })
  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: "Loại media",
    example: "AUDIO",
  })
  @IsString()
  @IsOptional()
  mediaType?: string;

  @ApiPropertyOptional({
    description: "Điểm số",
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({
    description: "Tags phân loại",
    example: ["present_simple", "verb"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: "Metadata bổ sung",
  })
  @IsObject()
  @IsOptional()
  metadata?: object;

  @ApiPropertyOptional({
    description: "Thứ tự hiển thị",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: "Trạng thái",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
