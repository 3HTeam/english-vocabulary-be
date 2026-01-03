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
import { LevelAdminService } from '../../services/admin/level-admin.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreateLevelDto } from '../../dto/create-level.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateLevelDto } from '../../dto/update-level.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Levels')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/levels')
export class LevelAdminController {
  constructor(private readonly levelAdminService: LevelAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create level' })
  async create(
    @Body() createLevelDto: CreateLevelDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const level = await this.levelAdminService.create(createLevelDto, user.id);
    return {
      message: 'Tạo cấp độ thành công',
      level,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List levels' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.levelAdminService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get level by id' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const level = await this.levelAdminService.findOne(id);
    return { level };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update level' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateLevelDto: UpdateLevelDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const level = await this.levelAdminService.update(id, updateLevelDto);
    return {
      message: 'Cập nhật cấp độ thành công',
      level,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete level' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.levelAdminService.delete(id);
    return { message: 'Xóa cấp độ thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete level' })
  async forceDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.levelAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn cấp độ thành công' };
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore deleted level' })
  async restoreDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.levelAdminService.restoreDelete(id);
    return { message: 'Khôi phục cấp độ thành công' };
  }
}
