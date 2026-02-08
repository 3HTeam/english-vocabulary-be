import { Controller, Get } from "@nestjs/common";
import { SettingAppService } from "../../services/app/setting-app.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorator";

@ApiTags("App - Settings")
@Controller("app/settings")
@Public()
export class SettingAppController {
  constructor(private readonly settingAppService: SettingAppService) {}

  @Get()
  @ApiOperation({ summary: "Get app settings (public)" })
  async get() {
    const setting = await this.settingAppService.get();
    return { setting };
  }
}
