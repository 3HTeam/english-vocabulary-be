import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateVocabularyDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsString()
  @IsNotEmpty()
  meaning: string;

  @IsString()
  @IsOptional()
  phonetic: string;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  exampleSentence: string;

  @IsString()
  @IsOptional()
  exampleTranslation: string;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsString()
  @IsOptional()
  audioUrl: string;

  @IsArray()
  @IsOptional()
  synonyms: string[];

  @IsArray()
  @IsOptional()
  antonyms: string[];

  @IsUUID()
  @IsNotEmpty()
  topicId: string;
}
