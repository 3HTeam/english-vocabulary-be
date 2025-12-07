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
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { UpdateTopicDto } from './dto/update-topic.dto';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@Controller('topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
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
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.topicService.findAll(paginationDto, paginationDto.search);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const topic = await this.topicService.findOne(id);
    return {
      topic,
    };
  }

  @Patch(':id')
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
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.topicService.delete(id);
    return {
      message: 'Xóa chủ đề thành công',
    };
  }
}
