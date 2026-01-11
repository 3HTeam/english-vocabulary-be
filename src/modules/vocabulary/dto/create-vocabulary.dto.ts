import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { PartOfSpeech } from '@prisma/client';

export class CreateDefinitionDto {
  @ApiProperty({
    description: 'Định nghĩa',
    example: 'a round fruit with red or green skin',
  })
  @IsString()
  @IsNotEmpty()
  definition: string;

  @ApiPropertyOptional({
    description: 'Bản dịch định nghĩa',
    example: 'một loại trái cây tròn có vỏ đỏ hoặc xanh',
  })
  @IsString()
  @IsOptional()
  translation?: string;

  @ApiPropertyOptional({
    description: 'Câu ví dụ',
    example: 'I eat an apple every day.',
  })
  @IsString()
  @IsOptional()
  example?: string;

  @ApiPropertyOptional({
    description: 'Dịch câu ví dụ',
    example: 'Tôi ăn một quả táo mỗi ngày.',
  })
  @IsString()
  @IsOptional()
  exampleTranslation?: string;
}

export class CreateMeaningDto {
  @ApiProperty({
    description: 'Loại từ',
    example: 'noun',
    enum: PartOfSpeech,
  })
  @IsEnum(PartOfSpeech)
  @IsNotEmpty()
  partOfSpeech: PartOfSpeech;

  @ApiPropertyOptional({
    description: 'Danh sách từ đồng nghĩa',
    example: ['fruit'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  synonyms?: string[];

  @ApiPropertyOptional({
    description: 'Danh sách từ trái nghĩa',
    example: [],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  antonyms?: string[];

  @ApiProperty({
    description: 'Danh sách định nghĩa',
    type: [CreateDefinitionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDefinitionDto)
  @ArrayMinSize(1)
  definitions: CreateDefinitionDto[];
}

export class CreateVocabularyDto {
  @ApiProperty({ description: 'Từ vựng', example: 'apple' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiPropertyOptional({
    description: 'Nghĩa của từ',
    example: 'quả táo',
  })
  @IsString()
  @IsOptional()
  translation?: string;

  @ApiPropertyOptional({ description: 'Phiên âm', example: '/ˈæp.əl/' })
  @IsString()
  @IsOptional()
  phonetic?: string;

  @ApiPropertyOptional({
    description: 'URL hình ảnh',
    example: 'https://example.com/apple.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'URL audio giọng Mỹ (US)',
    example: 'https://example.com/apple-us.mp3',
  })
  @IsString()
  @IsOptional()
  audioUrlUs?: string;

  @ApiPropertyOptional({
    description: 'URL audio giọng Anh (UK)',
    example: 'https://example.com/apple-uk.mp3',
  })
  @IsString()
  @IsOptional()
  audioUrlUk?: string;

  @ApiPropertyOptional({
    description: 'URL audio giọng Úc (AU)',
    example: 'https://example.com/apple-au.mp3',
  })
  @IsString()
  @IsOptional()
  audioUrlAu?: string;

  @ApiProperty({
    description: 'ID của chủ đề',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  topicId: string;

  @ApiProperty({
    description: 'Danh sách nghĩa của từ',
    type: [CreateMeaningDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMeaningDto)
  @ArrayMinSize(1)
  meanings: CreateMeaningDto[];
}
