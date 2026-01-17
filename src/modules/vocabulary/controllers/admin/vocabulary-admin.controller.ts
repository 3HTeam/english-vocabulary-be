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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VocabularyService } from '../../vocabulary.service';
import { CreateVocabularyDto } from '../../dto/create-vocabulary.dto';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { UpdateVocabularyDto } from '../../dto/update-vocabulary.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FilterVocabularyDto } from '../../dto/filter-vocabulary.dto';

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

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import vocabularies from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'File Excel (.xlsx, .xls) với các cột: word (bắt buộc), translation (bắt buộc), topicId (bắt buộc)',
        },
      },
      required: ['file'],
    },
  })
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new Error('Vui lòng upload file Excel');
    }

    const results = await this.vocabularyService.importFromExcel(file, user.id);

    let message = 'Import từ Excel hoàn tất';
    if (results.failed > 0 && results.success === 0) {
      message = 'Import thất bại - tất cả từ vựng đều lỗi';
    } else if (results.failed > 0 && results.success > 0) {
      message = `Import hoàn tất với ${results.success} thành công, ${results.failed} thất bại`;
    } else if (results.success > 0) {
      message = `Import thành công ${results.success} từ vựng`;
    }

    return {
      message,
      results,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List vocabularies' })
  async findAll(@Query() filterDto: FilterVocabularyDto) {
    return await this.vocabularyService.findAll(filterDto, filterDto.topicId);
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
