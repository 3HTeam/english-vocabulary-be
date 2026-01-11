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
import { AuthAppService } from '../services/app/auth-app.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('App - Auth')
@Controller('app/auth')
export class AuthAppController {
  constructor(private readonly authAppService: AuthAppService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new account' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authAppService.register(registerDto);
    return this.authAppService.formatResponse(result);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authAppService.login(loginDto);
    return this.authAppService.formatResponse(result);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '') || '';
    const result = await this.authAppService.getProfile(token);
    return this.authAppService.formatResponse(result);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user info' })
  async getMe(@CurrentUser() user: any) {
    return {
      user: this.authAppService.formatUser(user),
      message: 'Lấy thông tin user thành công',
    };
  }

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
    return this.authAppService.changePassword(
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
    return this.authAppService.refreshToken(refreshTokenDto);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout' })
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '') || '';
    return this.authAppService.logout(token);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const result = await this.authAppService.verifyEmail(verifyEmailDto);
    return this.authAppService.formatResponse(result);
  }
}
