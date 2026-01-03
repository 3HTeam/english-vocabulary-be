import { Module } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { VocabularyAdminController } from './controllers/admin/vocabulary-admin.controller';

@Module({
  controllers: [VocabularyAdminController],
  providers: [VocabularyService],
})
export class VocabularyModule {}
