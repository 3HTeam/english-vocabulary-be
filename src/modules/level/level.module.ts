import { Module } from '@nestjs/common';
import { LevelAdminController } from './controllers/admin/level-admin.controller';
import { LevelAdminService } from './services/admin/level-admin.service';

@Module({
  controllers: [LevelAdminController],
  providers: [LevelAdminService],
})
export class LevelModule {}
