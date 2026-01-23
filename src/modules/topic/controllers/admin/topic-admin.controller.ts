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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TopicService } from '../../topic.service';
import { CreateTopicDto } from '../../dto/create-topic.dto';
import { UpdateTopicDto } from '../../dto/update-topic.dto';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Topics')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/topics')
export class TopicAdminController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @ApiOperation({ summary: 'Create topic' })
  async create(
    @Body() createTopicDto: CreateTopicDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const topic = await this.topicService.create(createTopicDto, user?.id);
    return {
      message: 'Tạo chủ đề thành công',
      topic,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List topics' })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.topicService.getAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by id' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const topic = await this.topicService.getById(id);
    return {
      topic,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update topic' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const topic = await this.topicService.update(id, updateTopicDto, user?.id);
    return {
      message: 'Cập nhật chủ đề thành công',
      topic,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete topic' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.topicService.delete(id);
    return {
      message: 'Xóa chủ đề thành công',
    };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore topic' })
  async restore(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.topicService.restoreDelete(id);
    return { message: 'Khôi phục chủ đề thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete topic' })
  async forceDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.topicService.forceDelete(id);
    return { message: 'Xoá vĩnh viễn chủ đề thành công' };
  }
}
