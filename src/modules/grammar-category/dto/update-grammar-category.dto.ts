import { PartialType } from '@nestjs/mapped-types';
import { CreateGrammarCategoryDto } from './create-grammar-category.dto';

export class UpdateGrammarCategoryDto extends PartialType(
  CreateGrammarCategoryDto,
) {}
