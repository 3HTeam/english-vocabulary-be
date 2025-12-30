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
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
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
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.vocabularyService.findAll(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const vocabulary = await this.vocabularyService.findOne(id);
    return { vocabulary };
  }

  @Patch(':id')
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
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.vocabularyService.delete(id);
    return { message: 'Xóa từ vựng thành công' };
  }

  @Delete(':id/force')
  async forceDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.vocabularyService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn từ vựng thành công' };
  }

  @Put(':id/restore')
  async restoreDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.vocabularyService.restoreDelete(id);
    return { message: 'Khôi phục từ vựng thành công' };
  }
}
