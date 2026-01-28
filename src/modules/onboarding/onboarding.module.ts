import { Module } from '@nestjs/common';
import { OnboardingAdminController } from './controllers/admin/onboarding-admin.controller';
import { OnboardingAdminService } from './services/admin/onboarding-admin.service';

@Module({
  controllers: [OnboardingAdminController],
  providers: [OnboardingAdminService],
})
export class OnboardingModule {}
