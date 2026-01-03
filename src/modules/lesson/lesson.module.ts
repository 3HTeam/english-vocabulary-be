import { Module } from '@nestjs/common';
import { LessonAdminController } from './controllers/admin/lesson-admin.controller';
import { LessonAdminService } from './services/admin/lesson-admin.service';

@Module({
  controllers: [LessonAdminController],
  providers: [LessonAdminService],
  exports: [LessonAdminService],
})
export class LessonModule {}
