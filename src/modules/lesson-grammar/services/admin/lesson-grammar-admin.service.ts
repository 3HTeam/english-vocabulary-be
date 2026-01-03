import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonGrammarDto } from '../../dto/create-lesson-grammar.dto';
import { LessonGrammar, Prisma } from '@prisma/client';
import { UpdateLessonGrammarDto } from '../../dto/update-lesson-grammar.dto';
import { PaginationDto, PaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class LessonGrammarAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLessonGrammarDto): Promise<LessonGrammar> {
    try {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
      });
      if (!lesson) {
        throw new BadRequestException('Bài học không tồn tại');
      }

      const grammarTopic = await this.prisma.grammarTopic.findUnique({
        where: { id: dto.grammarTopicId },
      });
      if (!grammarTopic) {
        throw new BadRequestException('Chủ đề ngữ pháp không tồn tại');
      }

      const existing = await this.prisma.lessonGrammar.findFirst({
        where: { lessonId: dto.lessonId, grammarTopicId: dto.grammarTopicId },
      });
      if (existing) {
        throw new BadRequestException('Ngữ pháp đã có trong bài học này');
      }

      return await this.prisma.lessonGrammar.create({
        data: {
          lessonId: dto.lessonId,
          grammarTopicId: dto.grammarTopicId,
          order: dto.order ?? 0,
          isMain: dto.isMain ?? false,
          note: dto.note,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<{ lessonGrammars: LessonGrammar[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LessonGrammarWhereInput = {
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [lessonGrammars, total] = await this.prisma.$transaction([
      this.prisma.lessonGrammar.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          lesson: true,
          grammarTopic: true,
        },
      }),
      this.prisma.lessonGrammar.count({ where }),
    ]);

    return {
      lessonGrammars,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<LessonGrammar> {
    const lessonGrammar = await this.prisma.lessonGrammar.findUnique({
      where: { id },
      include: { lesson: true, grammarTopic: true },
    });
    if (!lessonGrammar) {
      throw new NotFoundException('Không tìm thấy ngữ pháp trong bài học');
    }
    return lessonGrammar;
  }

  async update(
    id: string,
    dto: UpdateLessonGrammarDto,
  ): Promise<LessonGrammar> {
    try {
      const existing = await this.prisma.lessonGrammar.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException('Không tìm thấy ngữ pháp trong bài học');
      }

      const updateData: Prisma.LessonGrammarUpdateInput = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.order !== undefined) updateData.order = dto.order;
      if (dto.isMain !== undefined) updateData.isMain = dto.isMain;
      if (dto.note !== undefined) updateData.note = dto.note;

      return await this.prisma.lessonGrammar.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const item = await this.prisma.lessonGrammar.findFirst({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy với id ${id}`);
    }

    await this.prisma.lessonGrammar.update({
      where: { id },
      data: {
        deletedAt: new Date().toISOString(),
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  async forceDelete(id: string): Promise<void> {
    const item = await this.prisma.lessonGrammar.findFirst({
      where: { id, isDeleted: true },
    });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy với id ${id}`);
    }
    await this.prisma.lessonGrammar.delete({ where: { id } });
  }

  async restoreDelete(id: string): Promise<void> {
    const item = await this.prisma.lessonGrammar.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy với id ${id}`);
    }
    if (!item.deletedAt) {
      throw new BadRequestException(`Chưa bị xóa`);
    }

    await this.prisma.lessonGrammar.update({
      where: { id },
      data: {
        deletedAt: null,
        isDeleted: false,
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
