import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBannerDto } from '../../dto/create-banner.dto';
import { Banner, Prisma } from '@prisma/client';
import { UpdateBannerDto } from '../../dto/update-banner.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class BannerAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBannerDto, userId?: string): Promise<Banner> {
    try {
      if (!dto.title || !dto.title.trim()) {
        throw new BadRequestException('Tiêu đề banner là bắt buộc');
      }

      // Check if module exists
      const module = await this.prisma.module.findUnique({
        where: { id: dto.moduleId },
      });
      if (!module) {
        throw new BadRequestException('Module không tồn tại');
      }

      const banner = await this.prisma.banner.create({
        data: {
          title: dto.title.trim(),
          imageUrl: dto.imageUrl,
          description: dto.description,
          status: dto.status ?? true,
          moduleId: dto.moduleId,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return banner;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ banners: Banner[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BannerWhereInput = {
      ...(pagination.search && {
        title: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [banners, total] = await this.prisma.$transaction([
      this.prisma.banner.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: { module: true },
      }),
      this.prisma.banner.count({
        where,
      }),
    ]);

    return {
      banners,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<Banner> {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
      include: { module: true },
    });
    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner');
    }
    return banner;
  }

  async update(
    id: string,
    dto: UpdateBannerDto,
    userId?: string,
  ): Promise<Banner> {
    try {
      const existingBanner = await this.prisma.banner.findUnique({
        where: { id },
      });
      if (!existingBanner) {
        throw new NotFoundException('Không tìm thấy banner');
      }

      if (
        !dto.title &&
        !dto.imageUrl &&
        !dto.description &&
        dto.status === undefined &&
        !dto.moduleId
      ) {
        throw new BadRequestException('Không có dữ liệu cập nhật');
      }

      if (dto.moduleId) {
        const module = await this.prisma.module.findUnique({
          where: { id: dto.moduleId },
        });
        if (!module) {
          throw new BadRequestException('Module không tồn tại');
        }
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
      if (dto.moduleId !== undefined) {
        updateData.moduleId = dto.moduleId;
      }

      const updatedBanner = await this.prisma.banner.update({
        where: { id },
        data: updateData,
      });

      return updatedBanner;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const banner = await this.prisma.banner.findFirst({
        where: { id },
      });

      if (!banner) {
        throw new NotFoundException(`Không tìm thấy banner với id ${id}`);
      }

      await this.prisma.banner.update({
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
      const banner = await this.prisma.banner.findFirst({
        where: { id, deletedAt: { not: null }, isDeleted: true },
      });

      if (!banner) {
        throw new NotFoundException(`Không tìm thấy banner với id ${id}`);
      }

      if (banner.deletedAt === null) {
        throw new BadRequestException(
          `Banner này cần được xoá mềm trước khi xoá vĩnh viễn`,
        );
      }

      await this.prisma.banner.delete({
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
      const banner = await this.prisma.banner.findUnique({
        where: { id },
      });

      if (!banner) {
        throw new NotFoundException(`Không tìm thấy banner với id ${id}`);
      }

      if (!banner.deletedAt) {
        throw new BadRequestException(`Banner với id ${id} chưa bị xóa`);
      }

      await this.prisma.banner.update({
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
