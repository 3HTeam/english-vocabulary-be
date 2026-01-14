import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { VocabularyService } from './vocabulary.service';
import { TranslationService } from './translation.service';
import { VocabularyAdminController } from './controllers/admin/vocabulary-admin.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [VocabularyAdminController],
  providers: [VocabularyService, TranslationService],
})
export class VocabularyModule {}
