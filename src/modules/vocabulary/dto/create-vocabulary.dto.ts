import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateVocabularyDto {
  @ApiProperty({ description: 'Từ vựng', example: 'apple' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({ description: 'Nghĩa của từ', example: 'quả táo' })
  @IsString()
  @IsNotEmpty()
  meaning: string;

  @ApiPropertyOptional({ description: 'Phiên âm', example: '/ˈæp.əl/' })
  @IsString()
  @IsOptional()
  phonetic?: string;

  @ApiPropertyOptional({ description: 'Loại từ', example: 'noun' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Câu ví dụ',
    example: 'I eat an apple every day.',
  })
  @IsString()
  @IsOptional()
  exampleSentence?: string;

  @ApiPropertyOptional({
    description: 'Dịch câu ví dụ',
    example: 'Tôi ăn một quả táo mỗi ngày.',
  })
  @IsString()
  @IsOptional()
  exampleTranslation?: string;

  @ApiPropertyOptional({
    description: 'URL hình ảnh',
    example: 'https://example.com/apple.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'URL audio',
    example: 'https://example.com/apple.mp3',
  })
  @IsString()
  @IsOptional()
  audioUrl?: string;

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
    description: 'ID của chủ đề',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  topicId: string;
}
