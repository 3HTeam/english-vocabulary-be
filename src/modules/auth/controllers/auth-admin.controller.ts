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
import { AuthService } from '../auth.service';
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
 * Login/Register logic giống App nhưng response bao gồm thêm:
 * - Role information
 * - Admin-specific fields
 * - Full user metadata
 *
 * Routes: /api/admin/auth
 *
 * Security:
 * - Login/Register: Public (không cần auth)
 * - Other endpoints: Require admin role
 */
@ApiTags('Admin - Auth')
@Controller('admin/auth')
export class AuthAdminController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng ký tài khoản admin (có thể cần approval)
   *
   * @route POST /api/admin/auth/register
   * @access Public (nhưng có thể cần admin approval)
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register admin account' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.registerAdmin(registerDto);
    return this.authService.formatAdminResponse(result);
  }

  /**
   * Đăng nhập admin
   *
   * @route POST /api/admin/auth/login
   * @access Public
   *
   * Login logic giống app nhưng response bao gồm:
   * - Role information
   * - Full user metadata
   * - Admin-specific fields
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login as admin' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return this.authService.formatAdminResponse(result);
  }

  /**
   * Lấy thông tin admin hiện tại
   *
   * @route GET /api/admin/auth/profile
   * @access Protected (Admin only)
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get admin profile (with full details)' })
  async getProfile(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '') || '';
    const result = await this.authService.getProfile(token);
    return this.authService.formatAdminResponse(result);
  }

  /**
   * Lấy thông tin admin hiện tại (sử dụng @CurrentUser)
   *
   * @route GET /api/admin/auth/me
   * @access Protected (Admin only)
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current admin info' })
  async getMe(@CurrentUser() user: any) {
    return {
      user: this.authService.formatAdminUser(user),
      message: 'Lấy thông tin admin thành công',
    };
  }

  /**
   * Đổi mật khẩu
   *
   * @route POST /api/admin/auth/change-password
   * @access Protected (Admin only)
   */
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
    return this.authService.changePassword(user.id, changePasswordDto, token);
  }

  /**
   * Refresh token
   *
   * @route POST /api/admin/auth/refresh
   * @access Public
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * Đăng xuất
   *
   * @route POST /api/admin/auth/logout
   * @access Protected (Admin only)
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout' })
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '') || '';
    return this.authService.logout(token);
  }

  /**
   * Xác thực email
   *
   * @route POST /api/admin/auth/verify-email
   * @access Public
   */
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(verifyEmailDto);
    return this.authService.formatAdminResponse(result);
  }
}
