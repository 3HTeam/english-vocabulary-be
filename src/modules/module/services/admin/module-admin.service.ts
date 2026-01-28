import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModuleDto } from '../../dto/create-module.dto';
import { Module, Prisma } from '@prisma/client';
import { UpdateModuleDto } from '../../dto/update-module.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class ModuleAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateModuleDto, userId?: string): Promise<Module> {
    try {
      if (!dto.name || !dto.name.trim()) {
        throw new BadRequestException('Tên module là bắt buộc');
      }

      const normalizedName = dto.name.trim();
      const duplicatedModule = await this.prisma.module.findFirst({
        where: {
          name: { equals: normalizedName, mode: 'insensitive' },
        },
      });

      if (duplicatedModule) {
        throw new BadRequestException('Tên module đã tồn tại');
      }

      const module = await this.prisma.module.create({
        data: {
          name: normalizedName,
          description: dto.description,
          status: dto.status ?? true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return module;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ modules: Module[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ModuleWhereInput = {
      ...(pagination.search && {
        name: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [modules, total] = await this.prisma.$transaction([
      this.prisma.module.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
      }),
      this.prisma.module.count({
        where,
      }),
    ]);

    return {
      modules,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<Module> {
    const module = await this.prisma.module.findUnique({
      where: { id },
    });
    if (!module) {
      throw new NotFoundException('Không tìm thấy module');
    }
    return module;
  }

  async update(
    id: string,
    dto: UpdateModuleDto,
    userId?: string,
  ): Promise<Module> {
    try {
      const existingModule = await this.prisma.module.findUnique({
        where: { id },
      });
      if (!existingModule) {
        throw new NotFoundException('Không tìm thấy module');
      }

      if (!dto.name && !dto.description && dto.status === undefined) {
        throw new BadRequestException('Không có dữ liệu cập nhật');
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.name !== undefined) {
        updateData.name = dto.name.trim();
      }
      if (dto.description !== undefined) {
        updateData.description = dto.description.trim();
      }
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }

      const updatedModule = await this.prisma.module.update({
        where: { id },
        data: updateData,
      });

      return updatedModule;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const module = await this.prisma.module.findFirst({
        where: { id },
      });

      if (!module) {
        throw new NotFoundException(`Không tìm thấy module với id ${id}`);
      }

      await this.prisma.module.update({
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
      const module = await this.prisma.module.findFirst({
        where: { id, deletedAt: { not: null }, isDeleted: true },
      });

      if (!module) {
        throw new NotFoundException(`Không tìm thấy module với id ${id}`);
      }

      if (module.deletedAt === null) {
        throw new BadRequestException(
          `Module này cần được xoá mềm trước khi xoá vĩnh viễn`,
        );
      }

      await this.prisma.module.delete({
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
      const module = await this.prisma.module.findUnique({
        where: { id },
      });

      if (!module) {
        throw new NotFoundException(`Không tìm thấy module với id ${id}`);
      }

      if (!module.deletedAt) {
        throw new BadRequestException(`Module với id ${id} chưa bị xóa`);
      }

      await this.prisma.module.update({
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
