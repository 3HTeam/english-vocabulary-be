import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGrammarCategoryDto } from '../../dto/create-grammar-category.dto';
import { GrammarCategory, Prisma } from '@prisma/client';
import { UpdateGrammarCategoryDto } from '../../dto/update-grammar-category.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class GrammarCategoryAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateGrammarCategoryDto,
    userId?: string,
  ): Promise<GrammarCategory> {
    try {
      if (!dto.name || !dto.name.trim()) {
        throw new BadRequestException('Tên danh mục ngữ pháp là bắt buộc');
      }

      const normalizedName = dto.name.trim();
      const duplicatedCategory = await this.prisma.grammarCategory.findFirst({
        where: {
          OR: [
            { name: { equals: normalizedName, mode: 'insensitive' } },
            { slug: dto.slug },
          ],
        },
      });

      if (duplicatedCategory) {
        throw new BadRequestException('Tên hoặc slug danh mục đã tồn tại');
      }

      const grammarCategory = await this.prisma.grammarCategory.create({
        data: {
          name: normalizedName,
          slug: dto.slug,
          imageUrl: dto.imageUrl,
          description: dto.description,
          status: dto.status ?? true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return grammarCategory;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ grammarCategories: GrammarCategory[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.GrammarCategoryWhereInput = {
      ...(pagination.search && {
        name: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [grammarCategories, total] = await this.prisma.$transaction([
      this.prisma.grammarCategory.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
      }),
      this.prisma.grammarCategory.count({
        where,
      }),
    ]);

    return {
      grammarCategories,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<GrammarCategory> {
    const grammarCategory = await this.prisma.grammarCategory.findUnique({
      where: { id },
    });
    if (!grammarCategory) {
      throw new NotFoundException('Không tìm thấy danh mục ngữ pháp');
    }
    return grammarCategory;
  }

  async update(
    id: string,
    dto: UpdateGrammarCategoryDto,
    userId?: string,
  ): Promise<GrammarCategory> {
    try {
      const existingCategory = await this.prisma.grammarCategory.findUnique({
        where: { id },
      });
      if (!existingCategory) {
        throw new NotFoundException('Không tìm thấy danh mục ngữ pháp');
      }

      if (
        !dto.name &&
        !dto.slug &&
        !dto.imageUrl &&
        !dto.description &&
        dto.status === undefined
      ) {
        throw new BadRequestException('Không có dữ liệu cập nhật');
      }

      const updateData: Prisma.GrammarCategoryUpdateInput = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.name !== undefined) {
        updateData.name = dto.name.trim();
      }
      if (dto.slug !== undefined) {
        updateData.slug = dto.slug.trim();
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

      const updatedCategory = await this.prisma.grammarCategory.update({
        where: { id },
        data: updateData,
      });

      return updatedCategory;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const grammarCategory = await this.prisma.grammarCategory.findFirst({
        where: { id },
      });

      if (!grammarCategory) {
        throw new NotFoundException(
          `Không tìm thấy danh mục ngữ pháp với id ${id}`,
        );
      }

      await this.prisma.grammarCategory.update({
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
      const grammarCategory = await this.prisma.grammarCategory.findFirst({
        where: { id, deletedAt: { not: null }, isDeleted: true },
      });

      if (!grammarCategory) {
        throw new NotFoundException(
          `Không tìm thấy danh mục ngữ pháp với id ${id}`,
        );
      }

      if (grammarCategory.deletedAt === null) {
        throw new BadRequestException(
          `Danh mục này cần được xoá mềm trước khi xoá vĩnh viễn`,
        );
      }

      await this.prisma.grammarCategory.delete({
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
      const grammarCategory = await this.prisma.grammarCategory.findUnique({
        where: { id },
      });

      if (!grammarCategory) {
        throw new NotFoundException(
          `Không tìm thấy danh mục ngữ pháp với id ${id}`,
        );
      }

      if (!grammarCategory.deletedAt) {
        throw new BadRequestException(
          `Danh mục ngữ pháp với id ${id} chưa bị xóa`,
        );
      }

      await this.prisma.grammarCategory.update({
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
