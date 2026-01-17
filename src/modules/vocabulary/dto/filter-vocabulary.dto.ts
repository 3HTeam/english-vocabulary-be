import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FilterVocabularyDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by topic ID',
    example: '73084ed8-f8e5-4b90-b5d6-3a6f810347e3',
  })
  @IsOptional()
  topicId?: string;
}
