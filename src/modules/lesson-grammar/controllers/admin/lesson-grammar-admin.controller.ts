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
import { LessonGrammarAdminService } from '../../services/admin/lesson-grammar-admin.service';
import { CreateLessonGrammarDto } from '../../dto/create-lesson-grammar.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateLessonGrammarDto } from '../../dto/update-lesson-grammar.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Admin - Lesson Grammars')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/lesson-grammars')
export class LessonGrammarAdminController {
  constructor(
    private readonly lessonGrammarAdminService: LessonGrammarAdminService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add grammar to lesson' })
  async create(@Body() dto: CreateLessonGrammarDto) {
    const lessonGrammar = await this.lessonGrammarAdminService.create(dto);
    return { message: 'Thêm ngữ pháp vào bài học thành công', lessonGrammar };
  }

  @Get()
  @ApiOperation({ summary: 'List lesson grammars' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.lessonGrammarAdminService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson grammar by id' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const lessonGrammar = await this.lessonGrammarAdminService.findOne(id);
    return { lessonGrammar };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lesson grammar' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLessonGrammarDto,
  ) {
    const lessonGrammar = await this.lessonGrammarAdminService.update(id, dto);
    return { message: 'Cập nhật thành công', lessonGrammar };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson grammar' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonGrammarAdminService.delete(id);
    return { message: 'Xóa thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete lesson grammar' })
  async forceDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonGrammarAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn thành công' };
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore deleted lesson grammar' })
  async restoreDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.lessonGrammarAdminService.restoreDelete(id);
    return { message: 'Khôi phục thành công' };
  }
}
