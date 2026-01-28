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
import { BannerAdminService } from '../../services/admin/banner-admin.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreateBannerDto } from '../../dto/create-banner.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateBannerDto } from '../../dto/update-banner.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Banners')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/banners')
export class BannerAdminController {
  constructor(private readonly bannerAdminService: BannerAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create banner' })
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const banner = await this.bannerAdminService.create(
      createBannerDto,
      user.id,
    );
    return {
      message: 'Tạo banner thành công',
      banner,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List banners' })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.bannerAdminService.getAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by id' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const banner = await this.bannerAdminService.getById(id);
    return { banner };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update banner' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const banner = await this.bannerAdminService.update(id, updateBannerDto);
    return {
      message: 'Cập nhật banner thành công',
      banner,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete banner' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.bannerAdminService.delete(id);
    return { message: 'Xóa banner thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete banner' })
  async forceDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.bannerAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn banner thành công' };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted banner' })
  async restoreDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.bannerAdminService.restoreDelete(id);
    return { message: 'Khôi phục banner thành công' };
  }
}
