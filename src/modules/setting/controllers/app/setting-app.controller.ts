import { Controller, Get } from '@nestjs/common';
import { SettingAppService } from '../../services/app/setting-app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App - Settings')
@Controller('app/settings')
export class SettingAppController {
  constructor(private readonly settingAppService: SettingAppService) {}

  @Get()
  @ApiOperation({ summary: 'Get app settings (public)' })
  async get() {
    const setting = await this.settingAppService.get();
    return { setting };
  }
}
