import { Controller, Get } from "@nestjs/common";
import { OnboardingAppService } from "../../services/app/onboarding-app.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorator";

@ApiTags("App - Onboardings")
@Controller("app/onboardings")
@Public()
export class OnboardingAppController {
  constructor(private readonly onboardingAppService: OnboardingAppService) {}

  @Get()
  @ApiOperation({ summary: "Get all onboardings (public)" })
  async getAll() {
    const onboardings = await this.onboardingAppService.getAll();
    return { onboardings };
  }
}
