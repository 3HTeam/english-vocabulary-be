import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';

/**
 * Auth Module
 *
 * Module này quản lý tất cả các thành phần liên quan đến authentication:
 * - AuthService: Business logic cho authentication
 * - AuthController: HTTP endpoints cho authentication
 * - AuthGuard: Guard để bảo vệ routes (set global)
 */
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    // Set AuthGuard làm global guard
    // Tất cả routes sẽ được bảo vệ bởi AuthGuard trừ khi dùng @Public()
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService], // Export AuthService để các module khác có thể dùng
})
export class AuthModule {}
