import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePopupDto } from '../../dto/create-popup.dto';
import { Popup, Prisma } from '@prisma/client';
import { UpdatePopupDto } from '../../dto/update-popup.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class PopupAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePopupDto, userId?: string): Promise<Popup> {
    try {
      if (!dto.title || !dto.title.trim()) {
        throw new BadRequestException('Tiêu đề popup là bắt buộc');
      }

      // Check if module exists
      const module = await this.prisma.module.findUnique({
        where: { id: dto.moduleId },
      });
      if (!module) {
        throw new BadRequestException('Module không tồn tại');
      }

      const popup = await this.prisma.popup.create({
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

      return popup;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ popups: Popup[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PopupWhereInput = {
      ...(pagination.search && {
        title: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [popups, total] = await this.prisma.$transaction([
      this.prisma.popup.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: { module: true },
      }),
      this.prisma.popup.count({
        where,
      }),
    ]);

    return {
      popups,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<Popup> {
    const popup = await this.prisma.popup.findUnique({
      where: { id },
      include: { module: true },
    });
    if (!popup) {
      throw new NotFoundException('Không tìm thấy popup');
    }
    return popup;
  }

  async update(
    id: string,
    dto: UpdatePopupDto,
    userId?: string,
  ): Promise<Popup> {
    try {
      const existingPopup = await this.prisma.popup.findUnique({
        where: { id },
      });
      if (!existingPopup) {
        throw new NotFoundException('Không tìm thấy popup');
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

      const updatedPopup = await this.prisma.popup.update({
        where: { id },
        data: updateData,
      });

      return updatedPopup;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const popup = await this.prisma.popup.findFirst({
        where: { id },
      });

      if (!popup) {
        throw new NotFoundException(`Không tìm thấy popup với id ${id}`);
      }

      await this.prisma.popup.update({
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
      const popup = await this.prisma.popup.findFirst({
        where: { id, deletedAt: { not: null }, isDeleted: true },
      });

      if (!popup) {
        throw new NotFoundException(`Không tìm thấy popup với id ${id}`);
      }

      if (popup.deletedAt === null) {
        throw new BadRequestException(
          `Popup này cần được xoá mềm trước khi xoá vĩnh viễn`,
        );
      }

      await this.prisma.popup.delete({
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
      const popup = await this.prisma.popup.findUnique({
        where: { id },
      });

      if (!popup) {
        throw new NotFoundException(`Không tìm thấy popup với id ${id}`);
      }

      if (!popup.deletedAt) {
        throw new BadRequestException(`Popup với id ${id} chưa bị xóa`);
      }

      await this.prisma.popup.update({
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
