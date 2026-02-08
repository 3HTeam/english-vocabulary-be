import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { DeviceAppController } from "./controllers/app/device-app.controller";
import { DeviceAppService } from "./services/app/device-app.service";

@Module({
  imports: [PrismaModule],
  controllers: [DeviceAppController],
  providers: [DeviceAppService],
  exports: [DeviceAppService],
})
export class DeviceModule {}
