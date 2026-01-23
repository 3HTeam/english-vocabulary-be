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
} from '@nestjs/common';
import { LessonExerciseAdminService } from '../../services/admin/lesson-exercise-admin.service';
import { CreateLessonExerciseDto } from '../../dto/create-lesson-exercise.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateLessonExerciseDto } from '../../dto/update-lesson-exercise.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Admin - Lesson Exercises')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/lesson-exercises')
export class LessonExerciseAdminController {
  constructor(
    private readonly lessonExerciseAdminService: LessonExerciseAdminService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create lesson exercise' })
  async create(@Body() dto: CreateLessonExerciseDto) {
    const lessonExercise = await this.lessonExerciseAdminService.create(dto);
    return { message: 'Tạo bài tập thành công', lessonExercise };
  }

  @Get()
  @ApiOperation({ summary: 'List lesson exercises' })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.lessonExerciseAdminService.getAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson exercise by id' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const lessonExercise = await this.lessonExerciseAdminService.getById(id);
    return { lessonExercise };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lesson exercise' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLessonExerciseDto,
  ) {
    const lessonExercise = await this.lessonExerciseAdminService.update(
      id,
      dto,
    );
    return { message: 'Cập nhật bài tập thành công', lessonExercise };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson exercise' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonExerciseAdminService.delete(id);
    return { message: 'Xóa bài tập thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete lesson exercise' })
  async forceDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonExerciseAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn bài tập thành công' };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted lesson exercise' })
  async restoreDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonExerciseAdminService.restoreDelete(id);
    return { message: 'Khôi phục bài tập thành công' };
  }
}
