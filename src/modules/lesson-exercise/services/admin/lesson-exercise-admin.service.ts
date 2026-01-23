import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonExerciseDto } from '../../dto/create-lesson-exercise.dto';
import { LessonExercise, Prisma } from '@prisma/client';
import { UpdateLessonExerciseDto } from '../../dto/update-lesson-exercise.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class LessonExerciseAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLessonExerciseDto): Promise<LessonExercise> {
    try {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
      });
      if (!lesson) {
        throw new BadRequestException('Bài học không tồn tại');
      }

      return await this.prisma.lessonExercise.create({
        data: {
          title: dto.title,
          type: dto.type,
          question: dto.question,
          answer: dto.answer,
          lessonId: dto.lessonId,
          score: dto.score,
          options: dto.options,
          explanation: dto.explanation,
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
  ): Promise<{ lessonExercises: LessonExercise[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LessonExerciseWhereInput = {
      ...(pagination.search && {
        title: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [lessonExercises, total] = await this.prisma.$transaction([
      this.prisma.lessonExercise.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: { lesson: true },
      }),
      this.prisma.lessonExercise.count({ where }),
    ]);

    return {
      lessonExercises,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<LessonExercise> {
    const lessonExercise = await this.prisma.lessonExercise.findUnique({
      where: { id },
      include: { lesson: true },
    });
    if (!lessonExercise) {
      throw new NotFoundException('Không tìm thấy bài tập');
    }
    return lessonExercise;
  }

  async update(
    id: string,
    dto: UpdateLessonExerciseDto,
  ): Promise<LessonExercise> {
    try {
      const existing = await this.prisma.lessonExercise.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException('Không tìm thấy bài tập');
      }

      if (dto.lessonId) {
        const lesson = await this.prisma.lesson.findUnique({
          where: { id: dto.lessonId },
        });
        if (!lesson) {
          throw new BadRequestException('Bài học không tồn tại');
        }
      }

      const updateData: Prisma.LessonExerciseUpdateInput = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.question !== undefined) updateData.question = dto.question;
      if (dto.answer !== undefined) updateData.answer = dto.answer;
      if (dto.lessonId !== undefined) {
        updateData.lesson = { connect: { id: dto.lessonId } };
      }
      if (dto.score !== undefined) updateData.score = dto.score;
      if (dto.options !== undefined) updateData.options = dto.options;
      if (dto.explanation !== undefined)
        updateData.explanation = dto.explanation;
      if (dto.order !== undefined) updateData.order = dto.order;
      if (dto.isKey !== undefined) updateData.isKey = dto.isKey;
      if (dto.note !== undefined) updateData.note = dto.note;

      return await this.prisma.lessonExercise.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const item = await this.prisma.lessonExercise.findFirst({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy bài tập với id ${id}`);
    }

    await this.prisma.lessonExercise.update({
      where: { id },
      data: {
        deletedAt: new Date().toISOString(),
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  async forceDelete(id: string): Promise<void> {
    const item = await this.prisma.lessonExercise.findFirst({
      where: { id, isDeleted: true },
    });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy bài tập với id ${id}`);
    }
    await this.prisma.lessonExercise.delete({ where: { id } });
  }

  async restoreDelete(id: string): Promise<void> {
    const item = await this.prisma.lessonExercise.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy bài tập với id ${id}`);
    }
    if (!item.deletedAt) {
      throw new BadRequestException(`Bài tập với id ${id} chưa bị xóa`);
    }

    await this.prisma.lessonExercise.update({
      where: { id },
      data: {
        deletedAt: null,
        isDeleted: false,
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
