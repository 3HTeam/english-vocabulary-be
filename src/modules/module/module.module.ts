import { Module } from '@nestjs/common';
import { ModuleAdminController } from './controllers/admin/module-admin.controller';
import { ModuleAdminService } from './services/admin/module-admin.service';

@Module({
  controllers: [ModuleAdminController],
  providers: [ModuleAdminService],
})
export class ModuleModule {}
