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
import { GrammarCategoryAdminService } from '../../services/admin/grammar-category-admin.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreateGrammarCategoryDto } from '../../dto/create-grammar-category.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateGrammarCategoryDto } from '../../dto/update-grammar-category.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Grammar Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/grammar-categories')
export class GrammarCategoryAdminController {
  constructor(
    private readonly grammarCategoryAdminService: GrammarCategoryAdminService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create grammar category' })
  async create(
    @Body() createGrammarCategoryDto: CreateGrammarCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const grammarCategory = await this.grammarCategoryAdminService.create(
      createGrammarCategoryDto,
      user.id,
    );
    return {
      message: 'Tạo danh mục ngữ pháp thành công',
      grammarCategory,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List grammar categories' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.grammarCategoryAdminService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grammar category by id' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const grammarCategory = await this.grammarCategoryAdminService.findOne(id);
    return { grammarCategory };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update grammar category' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateGrammarCategoryDto: UpdateGrammarCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const grammarCategory = await this.grammarCategoryAdminService.update(
      id,
      updateGrammarCategoryDto,
    );
    return {
      message: 'Cập nhật danh mục ngữ pháp thành công',
      grammarCategory,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete grammar category' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.grammarCategoryAdminService.delete(id);
    return { message: 'Xóa danh mục ngữ pháp thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete grammar category' })
  async forceDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.grammarCategoryAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn danh mục ngữ pháp thành công' };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted grammar category' })
  async restoreDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.grammarCategoryAdminService.restoreDelete(id);
    return { message: 'Khôi phục danh mục ngữ pháp thành công' };
  }
}
