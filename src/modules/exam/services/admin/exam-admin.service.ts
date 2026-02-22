import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  CreateExamDto,
  AddExamQuestionsDto,
  CreateExamSectionDto,
} from "../../dto/create-exam.dto";
import { UpdateExamDto, UpdateExamSectionDto } from "../../dto/update-exam.dto";
import { Exam, Prisma } from "@prisma/client";
import { PaginationDto, PaginationMeta } from "src/common/dto/pagination.dto";

const EXAM_INCLUDE = {
  level: true,
  sections: {
    orderBy: { order: "asc" as const },
    include: {
      examQuestions: {
        orderBy: { order: "asc" as const },
        include: {
          exercise: {
            include: {
              exerciseOptions: { orderBy: { order: "asc" as const } },
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class ExamAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== EXAM CRUD ====================

  async create(dto: CreateExamDto, userId?: string): Promise<Exam> {
    try {
      const level = await this.prisma.level.findUnique({
        where: { id: dto.levelId },
      });
      if (!level) {
        throw new BadRequestException("Cấp độ không tồn tại");
      }

      const exam = await this.prisma.exam.create({
        data: {
          title: dto.title,
          description: dto.description,
          imageUrl: dto.imageUrl,
          examType: dto.examType,
          duration: dto.duration,
          totalQuestions: dto.totalQuestions,
          maxScore: dto.maxScore,
          scoreType: dto.scoreType,
          status: dto.status ?? true,
          createdBy: userId,
          levelId: dto.levelId,
          ...(dto.sections && {
            sections: {
              create: dto.sections.map((s) => ({
                name: s.name,
                sectionType: s.sectionType,
                order: s.order,
                duration: s.duration,
                totalQuestions: s.totalQuestions,
                maxScore: s.maxScore,
              })),
            },
          }),
        },
        include: EXAM_INCLUDE,
      });

      return exam;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(
    pagination: PaginationDto,
  ): Promise<{ exams: Exam[]; meta: PaginationMeta }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ExamWhereInput = {
      ...(pagination.search && {
        title: { contains: pagination.search, mode: "insensitive" },
      }),
      ...(pagination.isDeleted != undefined && {
        isDeleted: pagination.isDeleted,
      }),
    };

    const [exams, total] = await this.prisma.$transaction([
      this.prisma.exam.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        where,
        include: EXAM_INCLUDE,
      }),
      this.prisma.exam.count({ where }),
    ]);

    return {
      exams,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<Exam> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: EXAM_INCLUDE,
    });
    if (!exam) {
      throw new NotFoundException("Không tìm thấy đề thi");
    }
    return exam;
  }

  async update(id: string, dto: UpdateExamDto): Promise<Exam> {
    try {
      const existing = await this.prisma.exam.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException("Không tìm thấy đề thi");
      }

      if (dto.levelId) {
        const level = await this.prisma.level.findUnique({
          where: { id: dto.levelId },
        });
        if (!level) {
          throw new BadRequestException("Cấp độ không tồn tại");
        }
      }

      const updateData: Prisma.ExamUpdateInput = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.examType !== undefined) updateData.examType = dto.examType;
      if (dto.duration !== undefined) updateData.duration = dto.duration;
      if (dto.totalQuestions !== undefined)
        updateData.totalQuestions = dto.totalQuestions;
      if (dto.maxScore !== undefined) updateData.maxScore = dto.maxScore;
      if (dto.scoreType !== undefined) updateData.scoreType = dto.scoreType;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.levelId !== undefined) {
        updateData.level = { connect: { id: dto.levelId } };
      }

      return await this.prisma.exam.update({
        where: { id },
        data: updateData,
        include: EXAM_INCLUDE,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const exam = await this.prisma.exam.findFirst({ where: { id } });
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy đề thi với id ${id}`);
    }

    await this.prisma.exam.update({
      where: { id },
      data: {
        deletedAt: new Date().toISOString(),
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  async forceDelete(id: string): Promise<void> {
    const exam = await this.prisma.exam.findFirst({
      where: { id, isDeleted: true },
    });
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy đề thi với id ${id}`);
    }
    await this.prisma.exam.delete({ where: { id } });
  }

  async restoreDelete(id: string): Promise<void> {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy đề thi với id ${id}`);
    }
    if (!exam.deletedAt) {
      throw new BadRequestException(`Đề thi với id ${id} chưa bị xóa`);
    }

    await this.prisma.exam.update({
      where: { id },
      data: {
        deletedAt: null,
        isDeleted: false,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  // ==================== SECTION CRUD ====================

  async addSection(examId: string, dto: CreateExamSectionDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      throw new NotFoundException("Không tìm thấy đề thi");
    }

    // Kiểm tra order đã tồn tại chưa
    const existingSection = await this.prisma.examSection.findUnique({
      where: { examId_order: { examId, order: dto.order } },
    });
    if (existingSection) {
      throw new BadRequestException(`Phần thi thứ tự ${dto.order} đã tồn tại`);
    }

    return await this.prisma.examSection.create({
      data: {
        name: dto.name,
        sectionType: dto.sectionType,
        order: dto.order,
        duration: dto.duration,
        totalQuestions: dto.totalQuestions,
        maxScore: dto.maxScore,
        examId,
      },
      include: {
        examQuestions: {
          orderBy: { order: "asc" },
          include: { exercise: true },
        },
      },
    });
  }

  async updateSection(sectionId: string, dto: UpdateExamSectionDto) {
    const section = await this.prisma.examSection.findUnique({
      where: { id: sectionId },
    });
    if (!section) {
      throw new NotFoundException("Không tìm thấy phần thi");
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.sectionType !== undefined) updateData.sectionType = dto.sectionType;
    if (dto.order !== undefined) updateData.order = dto.order;
    if (dto.duration !== undefined) updateData.duration = dto.duration;
    if (dto.totalQuestions !== undefined)
      updateData.totalQuestions = dto.totalQuestions;
    if (dto.maxScore !== undefined) updateData.maxScore = dto.maxScore;

    return await this.prisma.examSection.update({
      where: { id: sectionId },
      data: updateData,
      include: {
        examQuestions: {
          orderBy: { order: "asc" },
          include: { exercise: true },
        },
      },
    });
  }

  async deleteSection(sectionId: string): Promise<void> {
    const section = await this.prisma.examSection.findUnique({
      where: { id: sectionId },
    });
    if (!section) {
      throw new NotFoundException("Không tìm thấy phần thi");
    }
    await this.prisma.examSection.delete({ where: { id: sectionId } });
  }

  // ==================== EXAM QUESTION CRUD ====================

  async addQuestions(sectionId: string, dto: AddExamQuestionsDto) {
    const section = await this.prisma.examSection.findUnique({
      where: { id: sectionId },
    });
    if (!section) {
      throw new NotFoundException("Không tìm thấy phần thi");
    }

    // Validate tất cả exerciseId tồn tại
    const exerciseIds = dto.questions.map((q) => q.exerciseId);
    const exercises = await this.prisma.exercise.findMany({
      where: { id: { in: exerciseIds }, isDeleted: false },
    });
    if (exercises.length !== exerciseIds.length) {
      const foundIds = exercises.map((e) => e.id);
      const missingIds = exerciseIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Không tìm thấy bài tập: ${missingIds.join(", ")}`,
      );
    }

    // Tạo tất cả exam questions
    const created = await this.prisma.$transaction(
      dto.questions.map((q) =>
        this.prisma.examQuestion.create({
          data: {
            order: q.order,
            examSectionId: sectionId,
            exerciseId: q.exerciseId,
          },
          include: {
            exercise: {
              include: {
                exerciseOptions: { orderBy: { order: "asc" } },
              },
            },
          },
        }),
      ),
    );

    return created;
  }

  async removeQuestion(questionId: string): Promise<void> {
    const question = await this.prisma.examQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException("Không tìm thấy câu hỏi trong đề thi");
    }
    await this.prisma.examQuestion.delete({ where: { id: questionId } });
  }

  async removeAllQuestions(sectionId: string): Promise<void> {
    const section = await this.prisma.examSection.findUnique({
      where: { id: sectionId },
    });
    if (!section) {
      throw new NotFoundException("Không tìm thấy phần thi");
    }
    await this.prisma.examQuestion.deleteMany({
      where: { examSectionId: sectionId },
    });
  }
}
