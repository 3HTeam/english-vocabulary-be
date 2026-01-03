import { Module } from '@nestjs/common';
import { LessonVocabularyAdminController } from './controllers/admin/lesson-vocabulary-admin.controller';
import { LessonVocabularyAdminService } from './services/admin/lesson-vocabulary-admin.service';

@Module({
  controllers: [LessonVocabularyAdminController],
  providers: [LessonVocabularyAdminService],
  exports: [LessonVocabularyAdminService],
})
export class LessonVocabularyModule {}
