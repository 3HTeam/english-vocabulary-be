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
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

/**
 * Auth App Controller
 *
 * Controller này xử lý authentication cho Mobile App.
 * Response được tối ưu cho mobile:
 * - Chỉ bao gồm thông tin cần thiết
 * - Không bao gồm role, timestamps, admin fields
 * - Lightweight response
 *
 * Routes: /api/app/auth
 *
 * Security:
 * - Login/Register: Public
 * - Other endpoints: Require authentication (any user)
 */
@ApiTags('App - Auth')
@Controller('app/auth')
export class AuthAppController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng ký tài khoản mới
   *
   * @route POST /api/app/auth/register
   * @access Public
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new account' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.registerApp(registerDto);
    return this.authService.formatAppResponse(result);
  }

  /**
   * Đăng nhập
   *
   * @route POST /api/app/auth/login
   * @access Public
   *
   * Login logic giống admin nhưng response được tối ưu cho mobile:
   * - Không bao gồm role (handled by backend)
   * - Không bao gồm timestamps
   * - Chỉ essential user info
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return this.authService.formatAppResponse(result);
  }

  /**
   * Lấy thông tin user hiện tại
   *
   * @route GET /api/app/auth/profile
   * @access Protected (Authenticated users)
   */
  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile (mobile optimized)' })
  async getProfile(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '') || '';
    const result = await this.authService.getProfile(token);
    return this.authService.formatAppResponse(result);
  }

  /**
   * Lấy thông tin user hiện tại (sử dụng @CurrentUser)
   *
   * @route GET /api/app/auth/me
   * @access Protected (Authenticated users)
   */
  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user info' })
  async getMe(@CurrentUser() user: any) {
    return {
      user: this.authService.formatAppUser(user),
      message: 'Lấy thông tin user thành công',
    };
  }

  /**
   * Đổi mật khẩu
   *
   * @route POST /api/app/auth/change-password
   * @access Protected (Authenticated users)
   */
  @UseGuards(AuthGuard)
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
   * @route POST /api/app/auth/refresh
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
   * @route POST /api/app/auth/logout
   * @access Protected (Authenticated users)
   */
  @UseGuards(AuthGuard)
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
   * @route POST /api/app/auth/verify-email
   * @access Public
   */
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(verifyEmailDto);
    return this.authService.formatAppResponse(result);
  }
}
