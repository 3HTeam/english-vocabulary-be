import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto } from '../../dto/create-lesson.dto';
import { Lesson, Prisma } from '@prisma/client';
import { UpdateLessonDto } from '../../dto/update-lesson.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class LessonAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLessonDto, userId?: string): Promise<Lesson> {
    try {
      const level = await this.prisma.level.findUnique({
        where: { id: dto.levelId },
      });
      if (!level) {
        throw new BadRequestException('Level không tồn tại');
      }

      const topic = await this.prisma.topic.findUnique({
        where: { id: dto.topicId },
      });
      if (!topic) {
        throw new BadRequestException('Topic không tồn tại');
      }

      const duplicatedSlug = await this.prisma.lesson.findFirst({
        where: { slug: dto.slug },
      });
      if (duplicatedSlug) {
        throw new BadRequestException('Slug đã tồn tại');
      }

      const lesson = await this.prisma.lesson.create({
        data: {
          title: dto.title.trim(),
          slug: dto.slug,
          content: dto.content,
          levelId: dto.levelId,
          topicId: dto.topicId,
          description: dto.description,
          imageUrl: dto.imageUrl,
          difficulty: dto.difficulty ?? 'BEGINNER',
          order: dto.order ?? 0,
          objectives: dto.objectives ?? [],
          status: dto.status ?? true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return lesson;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ lessons: Lesson[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LessonWhereInput = {
      ...(pagination.search && {
        title: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [lessons, total] = await this.prisma.$transaction([
      this.prisma.lesson.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          level: true,
          topic: true,
        },
      }),
      this.prisma.lesson.count({ where }),
    ]);

    return {
      lessons,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<Lesson> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        level: true,
        topic: true,
        lessonVocabularies: { include: { vocabulary: true } },
        lessonGrammars: { include: { grammarTopic: true } },
        lessonExercises: true,
      },
    });
    if (!lesson) {
      throw new NotFoundException('Không tìm thấy bài học');
    }
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto): Promise<Lesson> {
    try {
      const existing = await this.prisma.lesson.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Không tìm thấy bài học');
      }

      if (dto.levelId) {
        const level = await this.prisma.level.findUnique({
          where: { id: dto.levelId },
        });
        if (!level) {
          throw new BadRequestException('Level không tồn tại');
        }
      }

      if (dto.topicId) {
        const topic = await this.prisma.topic.findUnique({
          where: { id: dto.topicId },
        });
        if (!topic) {
          throw new BadRequestException('Topic không tồn tại');
        }
      }

      const updateData: Prisma.LessonUpdateInput = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.title !== undefined) updateData.title = dto.title.trim();
      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.content !== undefined) updateData.content = dto.content;
      if (dto.levelId !== undefined) {
        updateData.level = { connect: { id: dto.levelId } };
      }
      if (dto.topicId !== undefined) {
        updateData.topic = { connect: { id: dto.topicId } };
      }
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.difficulty !== undefined) updateData.difficulty = dto.difficulty;
      if (dto.order !== undefined) updateData.order = dto.order;
      if (dto.objectives !== undefined) updateData.objectives = dto.objectives;
      if (dto.status !== undefined) updateData.status = dto.status;

      return await this.prisma.lesson.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const lesson = await this.prisma.lesson.findFirst({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với id ${id}`);
    }

    await this.prisma.lesson.update({
      where: { id },
      data: {
        deletedAt: new Date().toISOString(),
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  async forceDelete(id: string): Promise<void> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, isDeleted: true },
    });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với id ${id}`);
    }
    await this.prisma.lesson.delete({ where: { id } });
  }

  async restoreDelete(id: string): Promise<void> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với id ${id}`);
    }
    if (!lesson.deletedAt) {
      throw new BadRequestException(`Bài học với id ${id} chưa bị xóa`);
    }

    await this.prisma.lesson.update({
      where: { id },
      data: {
        deletedAt: null,
        isDeleted: false,
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
