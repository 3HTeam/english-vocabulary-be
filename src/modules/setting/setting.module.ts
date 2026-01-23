import { Module } from '@nestjs/common';
import { SettingAdminController } from './controllers/admin/setting-admin.controller';
import { SettingAppController } from './controllers/app/setting-app.controller';
import { SettingAdminService } from './services/admin/setting-admin.service';
import { SettingAppService } from './services/app/setting-app.service';

@Module({
  imports: [],
  controllers: [SettingAdminController, SettingAppController],
  providers: [SettingAdminService, SettingAppService],
  exports: [SettingAdminService, SettingAppService],
})
export class SettingModule {}
