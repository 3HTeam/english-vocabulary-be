import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGrammarExerciseDto } from '../../dto/create-grammar-exercise.dto';
import { GrammarExercise, Prisma } from '@prisma/client';
import { UpdateGrammarExerciseDto } from '../../dto/update-grammar-exercise.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class GrammarExerciseAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateGrammarExerciseDto,
    userId?: string,
  ): Promise<GrammarExercise> {
    try {
      const grammarTopic = await this.prisma.grammarTopic.findUnique({
        where: { id: dto.grammarTopicId },
      });
      if (!grammarTopic) {
        throw new BadRequestException('Chủ đề ngữ pháp không tồn tại');
      }

      const grammarExercise = await this.prisma.grammarExercise.create({
        data: {
          type: dto.type,
          question: dto.question,
          answer: dto.answer,
          grammarTopicId: dto.grammarTopicId,
          score: dto.score,
          options: dto.options,
          explanation: dto.explanation,
          order: dto.order ?? 0,
          status: dto.status ?? true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return grammarExercise;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ grammarExercises: GrammarExercise[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.GrammarExerciseWhereInput = {
      ...(pagination.search && {
        question: { contains: pagination.search, mode: 'insensitive' },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [grammarExercises, total] = await this.prisma.$transaction([
      this.prisma.grammarExercise.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          grammarTopic: true,
        },
      }),
      this.prisma.grammarExercise.count({ where }),
    ]);

    return {
      grammarExercises,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<GrammarExercise> {
    const grammarExercise = await this.prisma.grammarExercise.findUnique({
      where: { id },
      include: { grammarTopic: true },
    });
    if (!grammarExercise) {
      throw new NotFoundException('Không tìm thấy bài tập ngữ pháp');
    }
    return grammarExercise;
  }

  async update(
    id: string,
    dto: UpdateGrammarExerciseDto,
  ): Promise<GrammarExercise> {
    try {
      const existing = await this.prisma.grammarExercise.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException('Không tìm thấy bài tập ngữ pháp');
      }

      if (dto.grammarTopicId) {
        const grammarTopic = await this.prisma.grammarTopic.findUnique({
          where: { id: dto.grammarTopicId },
        });
        if (!grammarTopic) {
          throw new BadRequestException('Chủ đề ngữ pháp không tồn tại');
        }
      }

      const updateData: Prisma.GrammarExerciseUpdateInput = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.question !== undefined) updateData.question = dto.question;
      if (dto.answer !== undefined) updateData.answer = dto.answer;
      if (dto.grammarTopicId !== undefined) {
        updateData.grammarTopic = { connect: { id: dto.grammarTopicId } };
      }
      if (dto.score !== undefined) updateData.score = dto.score;
      if (dto.options !== undefined) updateData.options = dto.options;
      if (dto.explanation !== undefined)
        updateData.explanation = dto.explanation;
      if (dto.order !== undefined) updateData.order = dto.order;
      if (dto.status !== undefined) updateData.status = dto.status;

      return await this.prisma.grammarExercise.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const exercise = await this.prisma.grammarExercise.findFirst({
      where: { id },
    });
    if (!exercise) {
      throw new NotFoundException(
        `Không tìm thấy bài tập ngữ pháp với id ${id}`,
      );
    }

    await this.prisma.grammarExercise.update({
      where: { id },
      data: {
        deletedAt: new Date().toISOString(),
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  async forceDelete(id: string): Promise<void> {
    const exercise = await this.prisma.grammarExercise.findFirst({
      where: { id, isDeleted: true },
    });
    if (!exercise) {
      throw new NotFoundException(
        `Không tìm thấy bài tập ngữ pháp với id ${id}`,
      );
    }
    await this.prisma.grammarExercise.delete({ where: { id } });
  }

  async restoreDelete(id: string): Promise<void> {
    const exercise = await this.prisma.grammarExercise.findUnique({
      where: { id },
    });
    if (!exercise) {
      throw new NotFoundException(
        `Không tìm thấy bài tập ngữ pháp với id ${id}`,
      );
    }
    if (!exercise.deletedAt) {
      throw new BadRequestException(
        `Bài tập ngữ pháp với id ${id} chưa bị xóa`,
      );
    }

    await this.prisma.grammarExercise.update({
      where: { id },
      data: {
        deletedAt: null,
        isDeleted: false,
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
