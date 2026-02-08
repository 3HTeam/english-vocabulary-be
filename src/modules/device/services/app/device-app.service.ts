import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDeviceDto } from "../../dto/register-device.dto";

@Injectable()
export class DeviceAppService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Đăng ký hoặc cập nhật thông tin thiết bị của user
   * - Nếu pushToken đã tồn tại: cập nhật thông tin
   * - Nếu chưa có pushToken: tạo mới dựa trên userId + platform + deviceModel
   */
  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const {
      pushToken,
      pushTokenType,
      platform,
      deviceName,
      deviceModel,
      deviceBrand,
      osVersion,
      appVersion,
      appBuildNumber,
    } = dto;

    // Nếu có pushToken, dùng nó làm unique identifier
    if (pushToken) {
      const existingDevice = await this.prisma.userDevice.findUnique({
        where: { pushToken },
      });

      if (existingDevice) {
        // Cập nhật thông tin thiết bị
        return this.prisma.userDevice.update({
          where: { pushToken },
          data: {
            userId, // Có thể đổi user nếu đăng nhập tài khoản khác trên cùng thiết bị
            pushTokenType,
            deviceName,
            deviceModel,
            deviceBrand,
            platform,
            osVersion,
            appVersion,
            appBuildNumber,
            isActive: true,
            lastActiveAt: new Date(),
          },
        });
      }
    }

    // Tìm device dựa trên userId + platform + deviceModel (cho trường hợp chưa có pushToken)
    const existingByDevice = await this.prisma.userDevice.findFirst({
      where: {
        userId,
        platform,
        deviceModel: deviceModel || undefined,
      },
    });

    if (existingByDevice) {
      // Cập nhật device đã tồn tại
      return this.prisma.userDevice.update({
        where: { id: existingByDevice.id },
        data: {
          pushToken,
          pushTokenType,
          deviceName,
          deviceBrand,
          osVersion,
          appVersion,
          appBuildNumber,
          isActive: true,
          lastActiveAt: new Date(),
        },
      });
    }

    // Tạo mới device
    return this.prisma.userDevice.create({
      data: {
        userId,
        pushToken,
        pushTokenType,
        platform,
        deviceName,
        deviceModel,
        deviceBrand,
        osVersion,
        appVersion,
        appBuildNumber,
      },
    });
  }

  /**
   * Hủy đăng ký thiết bị (khi user logout)
   * Không xóa hẳn, chỉ đánh dấu isActive = false
   */
  async unregisterDevice(userId: string, pushToken: string) {
    const device = await this.prisma.userDevice.findFirst({
      where: {
        userId,
        pushToken,
      },
    });

    if (!device) {
      return {
        success: true,
        message: "Device not found or already unregistered",
      };
    }

    await this.prisma.userDevice.update({
      where: { id: device.id },
      data: {
        isActive: false,
        pushToken: null, // Xóa token để không nhận notification
      },
    });

    return { success: true, message: "Device unregistered successfully" };
  }

  /**
   * Lấy danh sách thiết bị của user
   */
  async getUserDevices(userId: string) {
    return this.prisma.userDevice.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        lastActiveAt: "desc",
      },
    });
  }

  /**
   * Cập nhật lastActiveAt khi user mở app
   */
  async updateLastActive(userId: string, deviceId: string) {
    return this.prisma.userDevice.updateMany({
      where: {
        id: deviceId,
        userId,
      },
      data: {
        lastActiveAt: new Date(),
      },
    });
  }
}
