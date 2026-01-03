import { Module } from '@nestjs/common';
import { GrammarTopicAdminController } from './controllers/admin/grammar-topic-admin.controller';
import { GrammarTopicAdminService } from './services/admin/grammar-topic-admin.service';

@Module({
  controllers: [GrammarTopicAdminController],
  providers: [GrammarTopicAdminService],
  exports: [GrammarTopicAdminService],
})
export class GrammarTopicModule {}
