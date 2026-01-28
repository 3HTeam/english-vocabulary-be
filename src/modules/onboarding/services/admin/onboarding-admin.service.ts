import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOnboardingDto } from '../../dto/create-onboarding.dto';
import { Onboarding, Prisma } from '@prisma/client';
import { UpdateOnboardingDto } from '../../dto/update-onboarding.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class OnboardingAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOnboardingDto, userId?: string): Promise<Onboarding> {
    try {
      if (!dto.title || !dto.title.trim()) {
        throw new BadRequestException('Tiêu đề onboarding là bắt buộc');
      }

      const onboarding = await this.prisma.onboarding.create({
        data: {
          title: dto.title.trim(),
          imageUrl: dto.imageUrl,
          description: dto.description,
          status: dto.status ?? true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return onboarding;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ onboardings: Onboarding[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OnboardingWhereInput = {
      ...(pagination.search && {
        title: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [onboardings, total] = await this.prisma.$transaction([
      this.prisma.onboarding.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
      }),
      this.prisma.onboarding.count({
        where,
      }),
    ]);

    return {
      onboardings,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<Onboarding> {
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { id },
    });
    if (!onboarding) {
      throw new NotFoundException('Không tìm thấy onboarding');
    }
    return onboarding;
  }

  async update(
    id: string,
    dto: UpdateOnboardingDto,
    userId?: string,
  ): Promise<Onboarding> {
    try {
      const existingOnboarding = await this.prisma.onboarding.findUnique({
        where: { id },
      });
      if (!existingOnboarding) {
        throw new NotFoundException('Không tìm thấy onboarding');
      }

      if (
        !dto.title &&
        !dto.imageUrl &&
        !dto.description &&
        dto.status === undefined
      ) {
        throw new BadRequestException('Không có dữ liệu cập nhật');
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.title !== undefined) {
        updateData.title = dto.title.trim();
      }
      if (dto.imageUrl !== undefined) {
        updateData.imageUrl = dto.imageUrl;
      }
      if (dto.description !== undefined) {
        updateData.description = dto.description.trim();
      }
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }

      const updatedOnboarding = await this.prisma.onboarding.update({
        where: { id },
        data: updateData,
      });

      return updatedOnboarding;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const onboarding = await this.prisma.onboarding.findFirst({
        where: { id },
      });

      if (!onboarding) {
        throw new NotFoundException(`Không tìm thấy onboarding với id ${id}`);
      }

      await this.prisma.onboarding.update({
        where: { id },
        data: {
          deletedAt: new Date().toISOString(),
          isDeleted: true,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async forceDelete(id: string): Promise<void> {
    try {
      const onboarding = await this.prisma.onboarding.findFirst({
        where: { id, deletedAt: { not: null }, isDeleted: true },
      });

      if (!onboarding) {
        throw new NotFoundException(`Không tìm thấy onboarding với id ${id}`);
      }

      if (onboarding.deletedAt === null) {
        throw new BadRequestException(
          `Onboarding này cần được xoá mềm trước khi xoá vĩnh viễn`,
        );
      }

      await this.prisma.onboarding.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async restoreDelete(id: string): Promise<void> {
    try {
      const onboarding = await this.prisma.onboarding.findUnique({
        where: { id },
      });

      if (!onboarding) {
        throw new NotFoundException(`Không tìm thấy onboarding với id ${id}`);
      }

      if (!onboarding.deletedAt) {
        throw new BadRequestException(`Onboarding với id ${id} chưa bị xóa`);
      }

      await this.prisma.onboarding.update({
        where: { id },
        data: {
          deletedAt: null,
          isDeleted: false,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}
