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
import { LessonVocabularyAdminService } from '../../services/admin/lesson-vocabulary-admin.service';
import { CreateLessonVocabularyDto } from '../../dto/create-lesson-vocabulary.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateLessonVocabularyDto } from '../../dto/update-lesson-vocabulary.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Admin - Lesson Vocabularies')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/lesson-vocabularies')
export class LessonVocabularyAdminController {
  constructor(
    private readonly lessonVocabularyAdminService: LessonVocabularyAdminService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add vocabulary to lesson' })
  async create(@Body() dto: CreateLessonVocabularyDto) {
    const lessonVocabulary =
      await this.lessonVocabularyAdminService.create(dto);
    return { message: 'Thêm từ vựng vào bài học thành công', lessonVocabulary };
  }

  @Get()
  @ApiOperation({ summary: 'List lesson vocabularies' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.lessonVocabularyAdminService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson vocabulary by id' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const lessonVocabulary =
      await this.lessonVocabularyAdminService.findOne(id);
    return { lessonVocabulary };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lesson vocabulary' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLessonVocabularyDto,
  ) {
    const lessonVocabulary = await this.lessonVocabularyAdminService.update(
      id,
      dto,
    );
    return { message: 'Cập nhật thành công', lessonVocabulary };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson vocabulary' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonVocabularyAdminService.delete(id);
    return { message: 'Xóa thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete lesson vocabulary' })
  async forceDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonVocabularyAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn thành công' };
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore deleted lesson vocabulary' })
  async restoreDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonVocabularyAdminService.restoreDelete(id);
    return { message: 'Khôi phục thành công' };
  }
}
