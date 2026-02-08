import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Onboarding } from "@prisma/client";

@Injectable()
export class OnboardingAppService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Onboarding[]> {
    const onboardings = await this.prisma.onboarding.findMany({
      where: {
        status: true,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
    });
    return onboardings;
  }
}
