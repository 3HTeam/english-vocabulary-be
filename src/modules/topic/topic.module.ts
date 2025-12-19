import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicAdminController } from './controllers/topic-admin.controller';

@Module({
  controllers: [TopicAdminController],
  providers: [TopicService],
})
export class TopicModule {}
