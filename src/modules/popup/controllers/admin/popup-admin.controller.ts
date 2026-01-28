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
import { PopupAdminService } from '../../services/admin/popup-admin.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreatePopupDto } from '../../dto/create-popup.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdatePopupDto } from '../../dto/update-popup.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Popups')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/popups')
export class PopupAdminController {
  constructor(private readonly popupAdminService: PopupAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create popup' })
  async create(
    @Body() createPopupDto: CreatePopupDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const popup = await this.popupAdminService.create(createPopupDto, user.id);
    return {
      message: 'Tạo popup thành công',
      popup,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List popups' })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.popupAdminService.getAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get popup by id' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const popup = await this.popupAdminService.getById(id);
    return { popup };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update popup' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePopupDto: UpdatePopupDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const popup = await this.popupAdminService.update(id, updatePopupDto);
    return {
      message: 'Cập nhật popup thành công',
      popup,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete popup' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.popupAdminService.delete(id);
    return { message: 'Xóa popup thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete popup' })
  async forceDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.popupAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn popup thành công' };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted popup' })
  async restoreDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.popupAdminService.restoreDelete(id);
    return { message: 'Khôi phục popup thành công' };
  }
}
