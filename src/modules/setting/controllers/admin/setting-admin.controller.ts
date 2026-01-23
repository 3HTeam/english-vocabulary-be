import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SettingAdminService } from '../../services/admin/setting-admin.service';
import { UpdateSettingDto } from '../../dto/update-setting.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Admin - Settings')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/settings')
export class SettingAdminController {
  constructor(private readonly settingAdminService: SettingAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get app settings' })
  async get() {
    const setting = await this.settingAdminService.get();
    return { setting };
  }

  @Put()
  @ApiOperation({ summary: 'Update app settings' })
  async update(@Body() updateDto: UpdateSettingDto) {
    const setting = await this.settingAdminService.update(updateDto);
    return {
      message: 'Cập nhật cài đặt thành công',
      setting,
    };
  }
}
