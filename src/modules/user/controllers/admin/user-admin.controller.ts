import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserAdminService } from '../../services/user-admin.service';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/users')
export class UserAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.userAdminService.getAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.userAdminService.getById(id);
    return { user };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userAdminService.update(id, updateUserDto);
    return {
      message: 'Cập nhật người dùng thành công',
      user,
    };
  }
}
