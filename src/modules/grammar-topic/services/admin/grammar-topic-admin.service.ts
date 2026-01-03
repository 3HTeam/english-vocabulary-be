import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGrammarTopicDto } from '../../dto/create-grammar-topic.dto';
import { GrammarTopic, Prisma } from '@prisma/client';
import { UpdateGrammarTopicDto } from '../../dto/update-grammar-topic.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class GrammarTopicAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateGrammarTopicDto,
    userId?: string,
  ): Promise<GrammarTopic> {
    try {
      if (!dto.title || !dto.title.trim()) {
        throw new BadRequestException('Tiêu đề chủ đề ngữ pháp là bắt buộc');
      }

      // Check if level exists
      const level = await this.prisma.level.findUnique({
        where: { id: dto.levelId },
      });
      if (!level) {
        throw new BadRequestException('Level không tồn tại');
      }

      // Check if grammar category exists
      const grammarCategory = await this.prisma.grammarCategory.findUnique({
        where: { id: dto.grammarCategoryId },
      });
      if (!grammarCategory) {
        throw new BadRequestException('Danh mục ngữ pháp không tồn tại');
      }

      // Check duplicate slug
      const duplicatedTopic = await this.prisma.grammarTopic.findFirst({
        where: { slug: dto.slug },
      });
      if (duplicatedTopic) {
        throw new BadRequestException('Slug đã tồn tại');
      }

      const grammarTopic = await this.prisma.grammarTopic.create({
        data: {
          title: dto.title.trim(),
          slug: dto.slug,
          content: dto.content,
          levelId: dto.levelId,
          grammarCategoryId: dto.grammarCategoryId,
          imageUrl: dto.imageUrl,
          description: dto.description,
          order: dto.order ?? 0,
          difficulty: dto.difficulty ?? 'BEGINNER',
          status: dto.status ?? true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return grammarTopic;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<{ grammarTopics: GrammarTopic[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.GrammarTopicWhereInput = {
      ...(pagination.search && {
        title: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [grammarTopics, total] = await this.prisma.$transaction([
      this.prisma.grammarTopic.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          level: true,
          grammarCategory: true,
        },
      }),
      this.prisma.grammarTopic.count({
        where,
      }),
    ]);

    return {
      grammarTopics,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<GrammarTopic> {
    const grammarTopic = await this.prisma.grammarTopic.findUnique({
      where: { id },
      include: {
        level: true,
        grammarCategory: true,
      },
    });
    if (!grammarTopic) {
      throw new NotFoundException('Không tìm thấy chủ đề ngữ pháp');
    }
    return grammarTopic;
  }

  async update(
    id: string,
    dto: UpdateGrammarTopicDto,
    userId?: string,
  ): Promise<GrammarTopic> {
    try {
      const existingTopic = await this.prisma.grammarTopic.findUnique({
        where: { id },
      });
      if (!existingTopic) {
        throw new NotFoundException('Không tìm thấy chủ đề ngữ pháp');
      }

      if (
        !dto.title &&
        !dto.slug &&
        !dto.content &&
        !dto.levelId &&
        !dto.grammarCategoryId &&
        !dto.imageUrl &&
        !dto.description &&
        dto.order === undefined &&
        dto.difficulty === undefined &&
        dto.status === undefined
      ) {
        throw new BadRequestException('Không có dữ liệu cập nhật');
      }

      // Check if level exists if updating levelId
      if (dto.levelId) {
        const level = await this.prisma.level.findUnique({
          where: { id: dto.levelId },
        });
        if (!level) {
          throw new BadRequestException('Level không tồn tại');
        }
      }

      // Check if grammar category exists if updating grammarCategoryId
      if (dto.grammarCategoryId) {
        const grammarCategory = await this.prisma.grammarCategory.findUnique({
          where: { id: dto.grammarCategoryId },
        });
        if (!grammarCategory) {
          throw new BadRequestException('Danh mục ngữ pháp không tồn tại');
        }
      }

      const updateData: Prisma.GrammarTopicUpdateInput = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.title !== undefined) {
        updateData.title = dto.title.trim();
      }
      if (dto.slug !== undefined) {
        updateData.slug = dto.slug.trim();
      }
      if (dto.content !== undefined) {
        updateData.content = dto.content;
      }
      if (dto.levelId !== undefined) {
        updateData.level = { connect: { id: dto.levelId } };
      }
      if (dto.grammarCategoryId !== undefined) {
        updateData.grammarCategory = { connect: { id: dto.grammarCategoryId } };
      }
      if (dto.imageUrl !== undefined) {
        updateData.imageUrl = dto.imageUrl;
      }
      if (dto.description !== undefined) {
        updateData.description = dto.description.trim();
      }
      if (dto.order !== undefined) {
        updateData.order = dto.order;
      }
      if (dto.difficulty !== undefined) {
        updateData.difficulty = dto.difficulty;
      }
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }

      const updatedTopic = await this.prisma.grammarTopic.update({
        where: { id },
        data: updateData,
      });

      return updatedTopic;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const grammarTopic = await this.prisma.grammarTopic.findFirst({
        where: { id },
      });

      if (!grammarTopic) {
        throw new NotFoundException(
          `Không tìm thấy chủ đề ngữ pháp với id ${id}`,
        );
      }

      await this.prisma.grammarTopic.update({
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
      const grammarTopic = await this.prisma.grammarTopic.findFirst({
        where: { id, deletedAt: { not: null }, isDeleted: true },
      });

      if (!grammarTopic) {
        throw new NotFoundException(
          `Không tìm thấy chủ đề ngữ pháp với id ${id}`,
        );
      }

      if (grammarTopic.deletedAt === null) {
        throw new BadRequestException(
          `Chủ đề này cần được xoá mềm trước khi xoá vĩnh viễn`,
        );
      }

      await this.prisma.grammarTopic.delete({
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
      const grammarTopic = await this.prisma.grammarTopic.findUnique({
        where: { id },
      });

      if (!grammarTopic) {
        throw new NotFoundException(
          `Không tìm thấy chủ đề ngữ pháp với id ${id}`,
        );
      }

      if (!grammarTopic.deletedAt) {
        throw new BadRequestException(
          `Chủ đề ngữ pháp với id ${id} chưa bị xóa`,
        );
      }

      await this.prisma.grammarTopic.update({
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
