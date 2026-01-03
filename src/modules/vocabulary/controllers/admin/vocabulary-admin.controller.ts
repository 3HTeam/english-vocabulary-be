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
import { VocabularyService } from '../../vocabulary.service';
import { CreateVocabularyDto } from '../../dto/create-vocabulary.dto';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateVocabularyDto } from '../../dto/update-vocabulary.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Vocabulary')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/vocabularies')
export class VocabularyAdminController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
  @ApiOperation({ summary: 'Create vocabulary' })
  async create(
    @Body() createVocabularyDto: CreateVocabularyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const vocabulary = await this.vocabularyService.create(
      createVocabularyDto,
      user.id,
    );
    return {
      message: 'Tạo từ vựng thành công',
      vocabulary,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List vocabularies' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.vocabularyService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vocabulary by id' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const vocabulary = await this.vocabularyService.findOne(id);
    return { vocabulary };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vocabulary' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateVocabularyDto: UpdateVocabularyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const vocabulary = await this.vocabularyService.update(
      id,
      updateVocabularyDto,
    );
    return {
      message: 'Cập nhật từ vựng thành công',
      vocabulary,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vocabulary' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.vocabularyService.delete(id);
    return { message: 'Xóa từ vựng thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete vocabulary' })
  async forceDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.vocabularyService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn từ vựng thành công' };
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore deleted vocabulary' })
  async restoreDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.vocabularyService.restoreDelete(id);
    return { message: 'Khôi phục từ vựng thành công' };
  }
}
