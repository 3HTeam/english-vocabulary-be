import { Module } from '@nestjs/common';
import { LessonExerciseAdminController } from './controllers/admin/lesson-exercise-admin.controller';
import { LessonExerciseAdminService } from './services/admin/lesson-exercise-admin.service';

@Module({
  controllers: [LessonExerciseAdminController],
  providers: [LessonExerciseAdminService],
  exports: [LessonExerciseAdminService],
})
export class LessonExerciseModule {}
