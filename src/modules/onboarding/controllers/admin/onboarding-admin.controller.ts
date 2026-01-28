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
import { OnboardingAdminService } from '../../services/admin/onboarding-admin.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreateOnboardingDto } from '../../dto/create-onboarding.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateOnboardingDto } from '../../dto/update-onboarding.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName?: string;
};

@ApiTags('Admin - Onboardings')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/onboardings')
export class OnboardingAdminController {
  constructor(
    private readonly onboardingAdminService: OnboardingAdminService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create onboarding' })
  async create(
    @Body() createOnboardingDto: CreateOnboardingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const onboarding = await this.onboardingAdminService.create(
      createOnboardingDto,
      user.id,
    );
    return {
      message: 'Tạo onboarding thành công',
      onboarding,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List onboardings' })
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.onboardingAdminService.getAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get onboarding by id' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const onboarding = await this.onboardingAdminService.getById(id);
    return { onboarding };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update onboarding' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateOnboardingDto: UpdateOnboardingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const onboarding = await this.onboardingAdminService.update(
      id,
      updateOnboardingDto,
    );
    return {
      message: 'Cập nhật onboarding thành công',
      onboarding,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete onboarding' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.onboardingAdminService.delete(id);
    return { message: 'Xóa onboarding thành công' };
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete onboarding' })
  async forceDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.onboardingAdminService.forceDelete(id);
    return { message: 'Xóa vĩnh viễn onboarding thành công' };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted onboarding' })
  async restoreDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.onboardingAdminService.restoreDelete(id);
    return { message: 'Khôi phục onboarding thành công' };
  }
}
