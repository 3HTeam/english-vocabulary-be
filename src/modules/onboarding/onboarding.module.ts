import { Module } from "@nestjs/common";
import { OnboardingAdminController } from "./controllers/admin/onboarding-admin.controller";
import { OnboardingAppController } from "./controllers/app/onboarding-app.controller";
import { OnboardingAdminService } from "./services/admin/onboarding-admin.service";
import { OnboardingAppService } from "./services/app/onboarding-app.service";

@Module({
  controllers: [OnboardingAdminController, OnboardingAppController],
  providers: [OnboardingAdminService, OnboardingAppService],
})
export class OnboardingModule {}
