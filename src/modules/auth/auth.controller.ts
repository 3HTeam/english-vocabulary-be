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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

/**
 * Auth Controller
 *
 * Controller này xử lý tất cả các HTTP requests liên quan đến authentication
 *
 * Routes:
 * - POST /auth/register - Đăng ký tài khoản mới (Public)
 * - POST /auth/login - Đăng nhập (Public)
 * - POST /auth/logout - Đăng xuất (Protected)
 * - POST /auth/refresh - Refresh token (Public)
 * - GET /auth/profile - Lấy thông tin user hiện tại (Protected)
 * - POST /auth/change-password - Đổi mật khẩu (Protected)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng ký tài khoản mới
   *
   * @route POST /auth/register
   * @access Public
   *
   * @param registerDto - Thông tin đăng ký (email, password, fullName)
   * @returns Thông tin user và session
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Đăng nhập
   *
   * @route POST /auth/login
   * @access Public
   *
   * @param loginDto - Thông tin đăng nhập (email, password)
   * @returns Thông tin user và session
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Đăng xuất
   *
   * @route POST /auth/logout
   * @access Protected (cần đăng nhập)
   *
   * @param authorization - Authorization header chứa Bearer token
   * @returns Thông báo đăng xuất thành công
   */
  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '') || '';
    return this.authService.logout(token);
  }

  /**
   * Refresh token
   *
   * @route POST /auth/refresh
   * @access Public
   *
   * @param refreshTokenDto - Refresh token
   * @returns Session mới với access token và refresh token mới
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * Lấy thông tin user hiện tại
   *
   * @route GET /auth/profile
   * @access Protected (cần đăng nhập)
   *
   * @param authorization - Authorization header chứa Bearer token
   * @returns Thông tin user
   */
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '') || '';
    return this.authService.getProfile(token);
  }

  /**
   * Lấy thông tin user hiện tại (sử dụng @CurrentUser decorator)
   *
   * @route GET /auth/me
   * @access Protected (cần đăng nhập)
   *
   * @param user - User info được inject từ AuthGuard qua @CurrentUser decorator
   * @returns Thông tin user
   */
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return {
      user,
      message: 'Lấy thông tin user thành công',
    };
  }

  /**
   * Đổi mật khẩu
   *
   * @route POST /auth/change-password
   * @access Protected (cần đăng nhập)
   *
   * @param user - User info được inject từ AuthGuard
   * @param changePasswordDto - Mật khẩu cũ và mới
   * @param authorization - Authorization header chứa Bearer token
   * @returns Thông báo đổi mật khẩu thành công
   */
  @UseGuards(AuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '') || '';
    return this.authService.changePassword(user.id, changePasswordDto, token);
  }
}
