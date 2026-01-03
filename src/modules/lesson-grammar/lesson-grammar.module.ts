import { Module } from '@nestjs/common';
import { LessonGrammarAdminController } from './controllers/admin/lesson-grammar-admin.controller';
import { LessonGrammarAdminService } from './services/admin/lesson-grammar-admin.service';

@Module({
  controllers: [LessonGrammarAdminController],
  providers: [LessonGrammarAdminService],
  exports: [LessonGrammarAdminService],
})
export class LessonGrammarModule {}
