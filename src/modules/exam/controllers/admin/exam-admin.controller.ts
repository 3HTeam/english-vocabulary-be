import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ExamAdminService } from "../../services/admin/exam-admin.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import {
  CreateExamDto,
  CreateExamSectionDto,
  AddExamQuestionsDto,
} from "../../dto/create-exam.dto";
import { UpdateExamDto, UpdateExamSectionDto } from "../../dto/update-exam.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags("Admin - Exams")
@ApiBearerAuth("JWT-auth")
@UseGuards(RolesGuard)
@Roles("ADMIN")
@Controller("admin/exams")
export class ExamAdminController {
  constructor(private readonly examAdminService: ExamAdminService) {}

  // ==================== EXAM ====================

  @Post()
  @ApiOperation({ summary: "Tạo đề thi (có thể kèm sections)" })
  async create(
    @Body() dto: CreateExamDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const exam = await this.examAdminService.create(dto, user.id);
    return { message: "Tạo đề thi thành công", exam };
  }

  @Get()
  @ApiOperation({ summary: "Danh sách đề thi" })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.examAdminService.getAll(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết đề thi (kèm sections + questions)" })
  async getById(@Param("id", new ParseUUIDPipe()) id: string) {
    const exam = await this.examAdminService.getById(id);
    return { exam };
  }

  @Put(":id")
  @ApiOperation({ summary: "Cập nhật thông tin đề thi" })
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateExamDto,
  ) {
    const exam = await this.examAdminService.update(id, dto);
    return { message: "Cập nhật đề thi thành công", exam };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xoá mềm đề thi" })
  async delete(@Param("id", new ParseUUIDPipe()) id: string) {
    await this.examAdminService.delete(id);
    return { message: "Xóa đề thi thành công" };
  }

  @Delete(":id/force")
  @ApiOperation({ summary: "Xoá vĩnh viễn đề thi" })
  async forceDelete(@Param("id", new ParseUUIDPipe()) id: string) {
    await this.examAdminService.forceDelete(id);
    return { message: "Xóa vĩnh viễn đề thi thành công" };
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Khôi phục đề thi đã xoá" })
  async restoreDelete(@Param("id", new ParseUUIDPipe()) id: string) {
    await this.examAdminService.restoreDelete(id);
    return { message: "Khôi phục đề thi thành công" };
  }

  // ==================== SECTIONS ====================

  @Post(":examId/sections")
  @ApiOperation({ summary: "Thêm phần thi vào đề" })
  async addSection(
    @Param("examId", new ParseUUIDPipe()) examId: string,
    @Body() dto: CreateExamSectionDto,
  ) {
    const section = await this.examAdminService.addSection(examId, dto);
    return { message: "Thêm phần thi thành công", section };
  }

  @Put("sections/:sectionId")
  @ApiOperation({ summary: "Cập nhật phần thi" })
  async updateSection(
    @Param("sectionId", new ParseUUIDPipe()) sectionId: string,
    @Body() dto: UpdateExamSectionDto,
  ) {
    const section = await this.examAdminService.updateSection(sectionId, dto);
    return { message: "Cập nhật phần thi thành công", section };
  }

  @Delete("sections/:sectionId")
  @ApiOperation({ summary: "Xoá phần thi (kèm câu hỏi bên trong)" })
  async deleteSection(
    @Param("sectionId", new ParseUUIDPipe()) sectionId: string,
  ) {
    await this.examAdminService.deleteSection(sectionId);
    return { message: "Xóa phần thi thành công" };
  }

  // ==================== EXAM QUESTIONS ====================

  @Post("sections/:sectionId/questions")
  @ApiOperation({
    summary: "Thêm câu hỏi vào phần thi (từ ngân hàng Exercise)",
  })
  async addQuestions(
    @Param("sectionId", new ParseUUIDPipe()) sectionId: string,
    @Body() dto: AddExamQuestionsDto,
  ) {
    const questions = await this.examAdminService.addQuestions(sectionId, dto);
    return { message: "Thêm câu hỏi thành công", questions };
  }

  @Delete("questions/:questionId")
  @ApiOperation({ summary: "Xoá 1 câu hỏi khỏi đề thi" })
  async removeQuestion(
    @Param("questionId", new ParseUUIDPipe()) questionId: string,
  ) {
    await this.examAdminService.removeQuestion(questionId);
    return { message: "Xóa câu hỏi thành công" };
  }

  @Delete("sections/:sectionId/questions")
  @ApiOperation({ summary: "Xoá toàn bộ câu hỏi trong phần thi" })
  async removeAllQuestions(
    @Param("sectionId", new ParseUUIDPipe()) sectionId: string,
  ) {
    await this.examAdminService.removeAllQuestions(sectionId);
    return { message: "Xóa tất cả câu hỏi thành công" };
  }
}
