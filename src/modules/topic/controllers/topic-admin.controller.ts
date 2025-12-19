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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { TopicService } from '../topic.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateTopicDto } from '../dto/create-topic.dto';
import { UpdateTopicDto } from '../dto/update-topic.dto';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

/**
 * Admin Topic Controller
 *
 * Controller này xử lý CRUD chủ đề cho Admin Panel.
 * Routes: /api/admin/topics
 * Security: Chỉ dành cho admin
 */
@ApiTags('Admin - Topics')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin/topics')
export class TopicAdminController {
  constructor(private readonly topicService: TopicService) {}

  /**
   * Tạo chủ đề (Admin)
   *
   * @route POST /api/admin/topics
   * @access Admin only
   */
  @Post()
  @ApiOperation({ summary: 'Tạo chủ đề (Admin)' })
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

  /**
   * Danh sách chủ đề (Admin)
   *
   * @route GET /api/admin/topics
   * @access Admin only
   */
  @Get()
  @ApiOperation({ summary: 'Danh sách chủ đề (Admin)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.topicService.findAll(paginationDto, paginationDto.search);
  }

  /**
   * Chi tiết chủ đề (Admin)
   *
   * @route GET /api/admin/topics/:id
   * @access Admin only
   */
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết chủ đề (Admin)' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const topic = await this.topicService.findOne(id);
    return {
      topic,
    };
  }

  /**
   * Cập nhật chủ đề (Admin)
   *
   * @route PATCH /api/admin/topics/:id
   * @access Admin only
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật chủ đề (Admin)' })
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

  /**
   * Xóa chủ đề (Admin)
   *
   * @route DELETE /api/admin/topics/:id
   * @access Admin only
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa chủ đề (Admin)' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.topicService.delete(id);
    return {
      message: 'Xóa chủ đề thành công',
    };
  }
}
