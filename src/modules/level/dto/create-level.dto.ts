import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateLevelDto {
  @ApiProperty({
    description: "Tên cấp độ",
    example: "Beginner",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Cấp độ CEFR",
    example: "A1",
  })
  @IsString()
  @IsNotEmpty()
  cefrLevel: string;

  @ApiPropertyOptional({
    description: "Mô tả cấp độ",
    example: "Cấp độ A1",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Điểm TOEIC tối thiểu",
    example: 120,
  })
  @IsNumber()
  @IsOptional()
  toeicScoreMin?: number;

  @ApiPropertyOptional({
    description: "Điểm TOEIC tối đa",
    example: 224,
  })
  @IsNumber()
  @IsOptional()
  toeicScoreMax?: number;

  @ApiPropertyOptional({
    description: "Band IELTS tối thiểu",
    example: 1.0,
  })
  @IsNumber()
  @IsOptional()
  ieltsMin?: number;

  @ApiPropertyOptional({
    description: "Band IELTS tối đa",
    example: 2.0,
  })
  @IsNumber()
  @IsOptional()
  ieltsMax?: number;

  @ApiPropertyOptional({
    description: "Thứ tự cấp độ",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: "Trạng thái cấp độ",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
