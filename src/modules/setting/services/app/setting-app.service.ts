import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Setting } from '@prisma/client';

@Injectable()
export class SettingAppService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<Setting | null> {
    const setting = await this.prisma.setting.findFirst();
    return setting;
  }
}
