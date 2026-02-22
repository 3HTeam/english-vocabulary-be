import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateExerciseDto } from "../../dto/create-exercise.dto";
import { Exercise, Prisma } from "@prisma/client";
import { UpdateExerciseDto } from "../../dto/update-exercise.dto";
import { PaginationDto, PaginationMeta } from "src/common/dto/pagination.dto";

@Injectable()
export class ExerciseAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExerciseDto, userId?: string): Promise<Exercise> {
    try {
      // Validate level
      const level = await this.prisma.level.findUnique({
        where: { id: dto.levelId },
      });
      if (!level) {
        throw new BadRequestException("Cấp độ không tồn tại");
      }

      // Validate grammarTopicId if provided
      if (dto.grammarTopicId) {
        const grammarTopic = await this.prisma.grammarTopic.findUnique({
          where: { id: dto.grammarTopicId },
        });
        if (!grammarTopic) {
          throw new BadRequestException("Chủ đề ngữ pháp không tồn tại");
        }
      }

      // Validate topicId if provided
      if (dto.topicId) {
        const topic = await this.prisma.topic.findUnique({
          where: { id: dto.topicId },
        });
        if (!topic) {
          throw new BadRequestException("Chủ đề từ vựng không tồn tại");
        }
      }

      const exercise = await this.prisma.exercise.create({
        data: {
          type: dto.type,
          category: dto.category,
          question: dto.question,
          explanation: dto.explanation,
          transcript: dto.transcript,
          content: dto.content,
          mediaUrl: dto.mediaUrl,
          mediaType: dto.mediaType as any,
          score: dto.score ?? 10,
          tags: dto.tags ?? [],
          metadata: dto.metadata as any,
          order: dto.order ?? 0,
          status: dto.status ?? true,
          createdBy: userId,
          levelId: dto.levelId,
          grammarTopicId: dto.grammarTopicId,
          topicId: dto.topicId,
          exerciseOptions: {
            create: dto.options.map((opt, index) => ({
              content: opt.content,
              isCorrect: opt.isCorrect,
              order: opt.order ?? index,
              metadata: opt.metadata as any,
            })),
          },
        },
        include: {
          exerciseOptions: { orderBy: { order: "asc" } },
          grammarTopic: true,
          topic: true,
          level: true,
        },
      });

      return exercise;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ exercises: Exercise[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ExerciseWhereInput = {
      ...(pagination.search && {
        question: { contains: pagination.search, mode: "insensitive" },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [exercises, total] = await this.prisma.$transaction([
      this.prisma.exercise.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        where,
        include: {
          exerciseOptions: { orderBy: { order: "asc" } },
          grammarTopic: true,
          topic: true,
          level: true,
        },
      }),
      this.prisma.exercise.count({ where }),
    ]);

    return {
      exercises,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<Exercise> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        exerciseOptions: { orderBy: { order: "asc" } },
        grammarTopic: true,
        topic: true,
        level: true,
      },
    });
    if (!exercise) {
      throw new NotFoundException("Không tìm thấy bài tập");
    }
    return exercise;
  }

  async update(id: string, dto: UpdateExerciseDto): Promise<Exercise> {
    try {
      const existing = await this.prisma.exercise.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException("Không tìm thấy bài tập");
      }

      // Validate foreign keys if provided
      if (dto.levelId) {
        const level = await this.prisma.level.findUnique({
          where: { id: dto.levelId },
        });
        if (!level) {
          throw new BadRequestException("Cấp độ không tồn tại");
        }
      }

      if (dto.grammarTopicId) {
        const grammarTopic = await this.prisma.grammarTopic.findUnique({
          where: { id: dto.grammarTopicId },
        });
        if (!grammarTopic) {
          throw new BadRequestException("Chủ đề ngữ pháp không tồn tại");
        }
      }

      if (dto.topicId) {
        const topic = await this.prisma.topic.findUnique({
          where: { id: dto.topicId },
        });
        if (!topic) {
          throw new BadRequestException("Chủ đề từ vựng không tồn tại");
        }
      }

      const updateData: Prisma.ExerciseUpdateInput = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.question !== undefined) updateData.question = dto.question;
      if (dto.explanation !== undefined)
        updateData.explanation = dto.explanation;
      if (dto.transcript !== undefined) updateData.transcript = dto.transcript;
      if (dto.content !== undefined) updateData.content = dto.content;
      if (dto.mediaUrl !== undefined) updateData.mediaUrl = dto.mediaUrl;
      if (dto.mediaType !== undefined)
        updateData.mediaType = dto.mediaType as any;
      if (dto.score !== undefined) updateData.score = dto.score;
      if (dto.tags !== undefined) updateData.tags = dto.tags;
      if (dto.metadata !== undefined) updateData.metadata = dto.metadata as any;
      if (dto.order !== undefined) updateData.order = dto.order;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.levelId !== undefined) {
        updateData.level = { connect: { id: dto.levelId } };
      }
      if (dto.grammarTopicId !== undefined) {
        updateData.grammarTopic = dto.grammarTopicId
          ? { connect: { id: dto.grammarTopicId } }
          : { disconnect: true };
      }
      if (dto.topicId !== undefined) {
        updateData.topic = dto.topicId
          ? { connect: { id: dto.topicId } }
          : { disconnect: true };
      }

      // If options are provided, delete old ones and create new ones
      if (dto.options !== undefined) {
        await this.prisma.exerciseOption.deleteMany({
          where: { exerciseId: id },
        });

        updateData.exerciseOptions = {
          create: dto.options.map((opt, index) => ({
            content: opt.content,
            isCorrect: opt.isCorrect,
            order: opt.order ?? index,
            metadata: opt.metadata as any,
          })),
        };
      }

      return await this.prisma.exercise.update({
        where: { id },
        data: updateData,
        include: {
          exerciseOptions: { orderBy: { order: "asc" } },
          grammarTopic: true,
          topic: true,
          level: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const exercise = await this.prisma.exercise.findFirst({
      where: { id },
    });
    if (!exercise) {
      throw new NotFoundException(`Không tìm thấy bài tập với id ${id}`);
    }

    await this.prisma.exercise.update({
      where: { id },
      data: {
        deletedAt: new Date().toISOString(),
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  async forceDelete(id: string): Promise<void> {
    const exercise = await this.prisma.exercise.findFirst({
      where: { id, isDeleted: true },
    });
    if (!exercise) {
      throw new NotFoundException(`Không tìm thấy bài tập với id ${id}`);
    }
    await this.prisma.exercise.delete({ where: { id } });
  }

  async restoreDelete(id: string): Promise<void> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });
    if (!exercise) {
      throw new NotFoundException(`Không tìm thấy bài tập với id ${id}`);
    }
    if (!exercise.deletedAt) {
      throw new BadRequestException(`Bài tập với id ${id} chưa bị xóa`);
    }

    await this.prisma.exercise.update({
      where: { id },
      data: {
        deletedAt: null,
        isDeleted: false,
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
