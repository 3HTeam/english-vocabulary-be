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
import { LessonAdminService } from '../../services/admin/lesson-admin.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreateLessonDto } from '../../dto/create-lesson.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateLessonDto } from '../../dto/update-lesson.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Lessons')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/lessons')
export class LessonAdminController {
  constructor(private readonly lessonAdminService: LessonAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create lesson' })
  async create(
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const lesson = await this.lessonAdminService.create(dto, user.id);
    return { message: 'Tạo bài học thành công', lesson };
  }

  @Get()
  @ApiOperation({ summary: 'List lessons' })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.lessonAdminService.getAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by id' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const lesson = await this.lessonAdminService.getById(id);
    return { lesson };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lesson' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLessonDto,
  ) {
    const lesson = await this.lessonAdminService.update(id, dto);
    return { message: 'Cập nhật bài học thành công', lesson };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonAdminService.delete(id);
    return { message: 'Xóa bài học thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete lesson' })
  async forceDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn bài học thành công' };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted lesson' })
  async restoreDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonAdminService.restoreDelete(id);
    return { message: 'Khôi phục bài học thành công' };
  }
}
