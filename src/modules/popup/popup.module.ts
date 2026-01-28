import { Module } from '@nestjs/common';
import { PopupAdminController } from './controllers/admin/popup-admin.controller';
import { PopupAdminService } from './services/admin/popup-admin.service';

@Module({
  controllers: [PopupAdminController],
  providers: [PopupAdminService],
})
export class PopupModule {}
