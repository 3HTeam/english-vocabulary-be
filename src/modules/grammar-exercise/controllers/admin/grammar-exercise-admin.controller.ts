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
import { GrammarExerciseAdminService } from '../../services/admin/grammar-exercise-admin.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreateGrammarExerciseDto } from '../../dto/create-grammar-exercise.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateGrammarExerciseDto } from '../../dto/update-grammar-exercise.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Grammar Exercises')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/grammar-exercises')
export class GrammarExerciseAdminController {
  constructor(
    private readonly grammarExerciseAdminService: GrammarExerciseAdminService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create grammar exercise' })
  async create(
    @Body() dto: CreateGrammarExerciseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const grammarExercise = await this.grammarExerciseAdminService.create(
      dto,
      user.id,
    );
    return { message: 'Tạo bài tập ngữ pháp thành công', grammarExercise };
  }

  @Get()
  @ApiOperation({ summary: 'List grammar exercises' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.grammarExerciseAdminService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grammar exercise by id' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const grammarExercise = await this.grammarExerciseAdminService.findOne(id);
    return { grammarExercise };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update grammar exercise' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateGrammarExerciseDto,
  ) {
    const grammarExercise = await this.grammarExerciseAdminService.update(
      id,
      dto,
    );
    return { message: 'Cập nhật bài tập ngữ pháp thành công', grammarExercise };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete grammar exercise' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.grammarExerciseAdminService.delete(id);
    return { message: 'Xóa bài tập ngữ pháp thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete grammar exercise' })
  async forceDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.grammarExerciseAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn bài tập ngữ pháp thành công' };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted grammar exercise' })
  async restoreDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.grammarExerciseAdminService.restoreDelete(id);
    return { message: 'Khôi phục bài tập ngữ pháp thành công' };
  }
}
