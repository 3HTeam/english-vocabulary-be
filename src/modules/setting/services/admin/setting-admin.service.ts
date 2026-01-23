import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Setting } from '@prisma/client';
import { UpdateSettingDto } from '../../dto/update-setting.dto';

@Injectable()
export class SettingAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<Setting> {
    let setting = await this.prisma.setting.findFirst();

    if (!setting) {
      setting = await this.prisma.setting.create({
        data: {},
      });
    }

    return setting;
  }

  async update(dto: UpdateSettingDto): Promise<Setting> {
    let setting = await this.prisma.setting.findFirst();

    if (!setting) {
      setting = await this.prisma.setting.create({
        data: {
          appName: dto.appName,
          appDescription: dto.appDescription,
          logoUrl: dto.logoUrl,
          faviconUrl: dto.faviconUrl,
          primaryColor: dto.primaryColor,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          facebook: dto.facebook,
          twitter: dto.twitter,
          instagram: dto.instagram,
          youtube: dto.youtube,
          tiktok: dto.tiktok,
        },
      });
    } else {
      setting = await this.prisma.setting.update({
        where: { id: setting.id },
        data: {
          ...(dto.appName !== undefined && { appName: dto.appName }),
          ...(dto.appDescription !== undefined && {
            appDescription: dto.appDescription,
          }),
          ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
          ...(dto.faviconUrl !== undefined && { faviconUrl: dto.faviconUrl }),
          ...(dto.primaryColor !== undefined && {
            primaryColor: dto.primaryColor,
          }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.facebook !== undefined && { facebook: dto.facebook }),
          ...(dto.twitter !== undefined && { twitter: dto.twitter }),
          ...(dto.instagram !== undefined && { instagram: dto.instagram }),
          ...(dto.youtube !== undefined && { youtube: dto.youtube }),
          ...(dto.tiktok !== undefined && { tiktok: dto.tiktok }),
        },
      });
    }

    return setting;
  }
}
