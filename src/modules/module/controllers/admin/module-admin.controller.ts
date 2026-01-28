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
import { ModuleAdminService } from '../../services/admin/module-admin.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreateModuleDto } from '../../dto/create-module.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateModuleDto } from '../../dto/update-module.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Modules')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/modules')
export class ModuleAdminController {
  constructor(private readonly moduleAdminService: ModuleAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create module' })
  async create(
    @Body() createModuleDto: CreateModuleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const module = await this.moduleAdminService.create(
      createModuleDto,
      user.id,
    );
    return {
      message: 'Tạo module thành công',
      module,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List modules' })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.moduleAdminService.getAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get module by id' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const module = await this.moduleAdminService.getById(id);
    return { module };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update module' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateModuleDto: UpdateModuleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const module = await this.moduleAdminService.update(id, updateModuleDto);
    return {
      message: 'Cập nhật module thành công',
      module,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete module' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.moduleAdminService.delete(id);
    return { message: 'Xóa module thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete module' })
  async forceDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.moduleAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn module thành công' };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted module' })
  async restoreDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.moduleAdminService.restoreDelete(id);
    return { message: 'Khôi phục module thành công' };
  }
}
