import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
    return await this.vocabularyService.findAll(
      paginationDto,
      paginationDto.search,
    );
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
}
