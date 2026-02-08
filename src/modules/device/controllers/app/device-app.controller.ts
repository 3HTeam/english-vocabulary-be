import { Controller, Post, Delete, Get, Body, Param } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { DeviceAppService } from "../../services/app/device-app.service";
import { RegisterDeviceDto } from "../../dto/register-device.dto";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import type { User } from "@prisma/client";

@ApiTags("App - Devices")
@ApiBearerAuth()
@Controller("app/devices")
export class DeviceAppController {
  constructor(private readonly deviceAppService: DeviceAppService) {}

  @Post()
  @ApiOperation({ summary: "Register device for push notifications" })
  async register(@CurrentUser() user: User, @Body() dto: RegisterDeviceDto) {
    const device = await this.deviceAppService.registerDevice(user.id, dto);
    return { device };
  }

  @Delete(":pushToken")
  @ApiOperation({ summary: "Unregister device (on logout)" })
  async unregister(
    @CurrentUser() user: User,
    @Param("pushToken") pushToken: string,
  ) {
    return this.deviceAppService.unregisterDevice(user.id, pushToken);
  }

  @Get()
  @ApiOperation({ summary: "Get user devices" })
  async getDevices(@CurrentUser() user: User) {
    const devices = await this.deviceAppService.getUserDevices(user.id);
    return { devices };
  }
}
