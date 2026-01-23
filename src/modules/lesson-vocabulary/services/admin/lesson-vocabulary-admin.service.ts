import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonVocabularyDto } from '../../dto/create-lesson-vocabulary.dto';
import { LessonVocabulary, Prisma } from '@prisma/client';
import { UpdateLessonVocabularyDto } from '../../dto/update-lesson-vocabulary.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class LessonVocabularyAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLessonVocabularyDto): Promise<LessonVocabulary> {
    try {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
      });
      if (!lesson) {
        throw new BadRequestException('Bài học không tồn tại');
      }

      const vocabulary = await this.prisma.vocabulary.findUnique({
        where: { id: dto.vocabularyId },
      });
      if (!vocabulary) {
        throw new BadRequestException('Từ vựng không tồn tại');
      }

      const existing = await this.prisma.lessonVocabulary.findFirst({
        where: { lessonId: dto.lessonId, vocabularyId: dto.vocabularyId },
      });
      if (existing) {
        throw new BadRequestException('Từ vựng đã có trong bài học này');
      }

      return await this.prisma.lessonVocabulary.create({
        data: {
          lessonId: dto.lessonId,
          vocabularyId: dto.vocabularyId,
          order: dto.order ?? 0,
          isKey: dto.isKey ?? false,
          note: dto.note,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ lessonVocabularies: LessonVocabulary[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LessonVocabularyWhereInput = {
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [lessonVocabularies, total] = await this.prisma.$transaction([
      this.prisma.lessonVocabulary.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          lesson: true,
          vocabulary: true,
        },
      }),
      this.prisma.lessonVocabulary.count({ where }),
    ]);

    return {
      lessonVocabularies,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<LessonVocabulary> {
    const lessonVocabulary = await this.prisma.lessonVocabulary.findUnique({
      where: { id },
      include: { lesson: true, vocabulary: true },
    });
    if (!lessonVocabulary) {
      throw new NotFoundException('Không tìm thấy từ vựng trong bài học');
    }
    return lessonVocabulary;
  }

  async update(
    id: string,
    dto: UpdateLessonVocabularyDto,
  ): Promise<LessonVocabulary> {
    try {
      const existing = await this.prisma.lessonVocabulary.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException('Không tìm thấy từ vựng trong bài học');
      }

      const updateData: Prisma.LessonVocabularyUpdateInput = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.order !== undefined) updateData.order = dto.order;
      if (dto.isKey !== undefined) updateData.isKey = dto.isKey;
      if (dto.note !== undefined) updateData.note = dto.note;

      return await this.prisma.lessonVocabulary.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const item = await this.prisma.lessonVocabulary.findFirst({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy với id ${id}`);
    }

    await this.prisma.lessonVocabulary.update({
      where: { id },
      data: {
        deletedAt: new Date().toISOString(),
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  async forceDelete(id: string): Promise<void> {
    const item = await this.prisma.lessonVocabulary.findFirst({
      where: { id, isDeleted: true },
    });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy với id ${id}`);
    }
    await this.prisma.lessonVocabulary.delete({ where: { id } });
  }

  async restoreDelete(id: string): Promise<void> {
    const item = await this.prisma.lessonVocabulary.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy với id ${id}`);
    }
    if (!item.deletedAt) {
      throw new BadRequestException(`Chưa bị xóa`);
    }

    await this.prisma.lessonVocabulary.update({
      where: { id },
      data: {
        deletedAt: null,
        isDeleted: false,
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
