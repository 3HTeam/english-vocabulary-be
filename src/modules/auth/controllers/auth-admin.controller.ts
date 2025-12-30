import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthAdminService } from '../services/auth-admin.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

/**
 * Auth Admin Controller
 *
 * Controller này xử lý authentication cho Admin Panel.
 * Routes: /api/admin/auth
 */
@ApiTags('Admin - Auth')
@Controller('admin/auth')
export class AuthAdminController {
  constructor(private readonly authAdminService: AuthAdminService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register admin account' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authAdminService.register(registerDto);
    return this.authAdminService.formatResponse(result);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login as admin' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authAdminService.login(loginDto);
    return this.authAdminService.formatResponse(result);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get admin profile' })
  async getProfile(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '') || '';
    const result = await this.authAdminService.getProfile(token);
    return this.authAdminService.formatResponse(result);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current admin info' })
  async getMe(@CurrentUser() user: any) {
    return {
      user: this.authAdminService.formatUser(user),
      message: 'Lấy thông tin admin thành công',
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '') || '';
    return this.authAdminService.changePassword(
      user.id,
      changePasswordDto,
      token,
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authAdminService.refreshToken(refreshTokenDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout' })
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '') || '';
    return this.authAdminService.logout(token);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const result = await this.authAdminService.verifyEmail(verifyEmailDto);
    return this.authAdminService.formatResponse(result);
  }
}
