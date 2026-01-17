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
import { GrammarTopicAdminService } from '../../services/admin/grammar-topic-admin.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreateGrammarTopicDto } from '../../dto/create-grammar-topic.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateGrammarTopicDto } from '../../dto/update-grammar-topic.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Grammar Topics')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/grammar-topics')
export class GrammarTopicAdminController {
  constructor(
    private readonly grammarTopicAdminService: GrammarTopicAdminService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create grammar topic' })
  async create(
    @Body() createGrammarTopicDto: CreateGrammarTopicDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const grammarTopic = await this.grammarTopicAdminService.create(
      createGrammarTopicDto,
      user.id,
    );
    return {
      message: 'Tạo chủ đề ngữ pháp thành công',
      grammarTopic,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List grammar topics' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.grammarTopicAdminService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grammar topic by id' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const grammarTopic = await this.grammarTopicAdminService.findOne(id);
    return { grammarTopic };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update grammar topic' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateGrammarTopicDto: UpdateGrammarTopicDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const grammarTopic = await this.grammarTopicAdminService.update(
      id,
      updateGrammarTopicDto,
    );
    return {
      message: 'Cập nhật chủ đề ngữ pháp thành công',
      grammarTopic,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete grammar topic' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.grammarTopicAdminService.delete(id);
    return { message: 'Xóa chủ đề ngữ pháp thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete grammar topic' })
  async forceDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.grammarTopicAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn chủ đề ngữ pháp thành công' };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted grammar topic' })
  async restoreDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.grammarTopicAdminService.restoreDelete(id);
    return { message: 'Khôi phục chủ đề ngữ pháp thành công' };
  }
}
