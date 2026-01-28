import { Module } from '@nestjs/common';
import { BannerAdminController } from './controllers/admin/banner-admin.controller';
import { BannerAdminService } from './services/admin/banner-admin.service';

@Module({
  controllers: [BannerAdminController],
  providers: [BannerAdminService],
})
export class BannerModule {}
