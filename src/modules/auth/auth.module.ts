import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthAdminController } from './controllers/auth-admin.controller';
import { AuthAppController } from './controllers/auth-app.controller';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = (config.get<string | number>('JWT_EXPIRES_IN') ||
          '3600s') as JwtSignOptions['expiresIn'];
        return {
          secret: config.get<string>('JWT_SECRET') || 'change_me',
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthAdminController, AuthAppController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
