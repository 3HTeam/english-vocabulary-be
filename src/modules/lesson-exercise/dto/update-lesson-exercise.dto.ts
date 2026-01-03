import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonExerciseDto } from './create-lesson-exercise.dto';

export class UpdateLessonExerciseDto extends PartialType(
  CreateLessonExerciseDto,
) {}
