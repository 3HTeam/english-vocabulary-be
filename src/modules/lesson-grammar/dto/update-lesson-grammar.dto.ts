import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonGrammarDto } from './create-lesson-grammar.dto';

export class UpdateLessonGrammarDto extends PartialType(
  CreateLessonGrammarDto,
) {}
