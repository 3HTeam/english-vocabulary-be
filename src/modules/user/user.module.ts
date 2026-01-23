import { Module } from '@nestjs/common';
import { UserAdminController } from './controllers/admin/user-admin.controller';
import { UserAdminService } from './services/user-admin.service';

@Module({
  imports: [],
  controllers: [UserAdminController],
  providers: [UserAdminService],
  exports: [UserAdminService],
})
export class UserModule {}
