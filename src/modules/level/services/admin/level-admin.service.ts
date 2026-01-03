import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLevelDto } from '../../dto/create-level.dto';
import { Level, Prisma } from '@prisma/client';
import { UpdateLevelDto } from '../../dto/update-level.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class LevelAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLevelDto, userId?: string): Promise<Level> {
    try {
      if (!dto.name || !dto.name.trim()) {
        throw new BadRequestException('Tên cấp độ là bắt buộc');
      }

      const normalizedName = dto.name.trim();
      const duplicatedLevel = await this.prisma.level.findFirst({
        where: {
          name: { equals: normalizedName, mode: 'insensitive' },
        },
      });

      if (duplicatedLevel) {
        throw new BadRequestException('Tên cấp độ đã tồn tại');
      }

      const level = await this.prisma.level.create({
        data: {
          name: normalizedName,
          code: dto.code,
          description: dto.description,
          order: dto.order ?? 0,
          status: dto.status ?? true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return level;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<{ levels: Level[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LevelWhereInput = {
      ...(pagination.search && {
        name: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [levels, total] = await this.prisma.$transaction([
      this.prisma.level.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
      }),
      this.prisma.level.count({
        where,
      }),
    ]);

    return {
      levels,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<Level> {
    const level = await this.prisma.level.findUnique({
      where: { id },
    });
    if (!level) {
      throw new NotFoundException('Không tìm thấy cấp độ');
    }
    return level;
  }

  async update(
    id: string,
    dto: UpdateLevelDto,
    userId?: string,
  ): Promise<Level> {
    try {
      const existingLevel = await this.prisma.level.findUnique({
        where: { id },
      });
      if (!existingLevel) {
        throw new NotFoundException('Không tìm thấy cấp độ');
      }

      if (
        !dto.name &&
        !dto.code &&
        !dto.description &&
        !dto.order &&
        !dto.status
      ) {
        throw new BadRequestException('Không có dữ liệu cập nhật');
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.name !== undefined) {
        updateData.name = dto.name.trim();
      }
      if (dto.code !== undefined) {
        updateData.code = dto.code.trim();
      }
      if (dto.description !== undefined) {
        updateData.description = dto.description.trim();
      }
      if (dto.order !== undefined) {
        updateData.order = dto.order;
      }
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }

      const updatedLevel = await this.prisma.level.update({
        where: { id },
        data: updateData,
      });

      return updatedLevel;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const level = await this.prisma.level.findFirst({
        where: { id },
      });

      if (!level) {
        throw new NotFoundException(`Không tìm thấy cấp độ với id ${id}`);
      }

      await this.prisma.level.update({
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
      const level = await this.prisma.level.findFirst({
        where: { id, deletedAt: { not: null }, isDeleted: true },
      });

      if (!level) {
        throw new NotFoundException(`Không tìm thấy cấp độ với id ${id}`);
      }

      if (level.deletedAt === null) {
        throw new BadRequestException(
          `Cấp độ này cần được xoá mềm trước khi xoá vĩnh viễn`,
        );
      }

      await this.prisma.level.delete({
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
      const level = await this.prisma.level.findUnique({
        where: { id },
      });

      if (!level) {
        throw new NotFoundException(`Không tìm thấy cấp độ với id ${id}`);
      }

      if (!level.deletedAt) {
        throw new BadRequestException(`Cấp độ với id ${id} chưa bị xóa`);
      }

      await this.prisma.level.update({
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
