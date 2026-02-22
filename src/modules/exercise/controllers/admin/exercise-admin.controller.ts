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
import { ExerciseAdminService } from "../../services/admin/exercise-admin.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { CreateExerciseDto } from "../../dto/create-exercise.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { UpdateExerciseDto } from "../../dto/update-exercise.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags("Admin - Exercises")
@ApiBearerAuth("JWT-auth")
@UseGuards(RolesGuard)
@Roles("ADMIN")
@Controller("admin/exercises")
export class ExerciseAdminController {
  constructor(private readonly exerciseAdminService: ExerciseAdminService) {}

  @Post()
  @ApiOperation({ summary: "Create exercise" })
  async create(
    @Body() dto: CreateExerciseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const exercise = await this.exerciseAdminService.create(dto, user.id);
    return { message: "Tạo bài tập thành công", exercise };
  }

  @Get()
  @ApiOperation({ summary: "List exercises" })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.exerciseAdminService.getAll(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get exercise by id" })
  async getById(@Param("id", new ParseUUIDPipe()) id: string) {
    const exercise = await this.exerciseAdminService.getById(id);
    return { exercise };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update exercise" })
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateExerciseDto,
  ) {
    const exercise = await this.exerciseAdminService.update(id, dto);
    return { message: "Cập nhật bài tập thành công", exercise };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete exercise" })
  async delete(@Param("id", new ParseUUIDPipe()) id: string) {
    await this.exerciseAdminService.delete(id);
    return { message: "Xóa bài tập thành công" };
  }

  @Delete(":id/force")
  @ApiOperation({ summary: "Force delete exercise" })
  async forceDelete(@Param("id", new ParseUUIDPipe()) id: string) {
    await this.exerciseAdminService.forceDelete(id);
    return { message: "Xóa vĩnh viễn bài tập thành công" };
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore deleted exercise" })
  async restoreDelete(@Param("id", new ParseUUIDPipe()) id: string) {
    await this.exerciseAdminService.restoreDelete(id);
    return { message: "Khôi phục bài tập thành công" };
  }
}
