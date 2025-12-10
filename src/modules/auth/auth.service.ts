import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../database/database.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

/**
 * Auth Service
 *
 * Service này xử lý tất cả logic liên quan đến authentication:
 * - Đăng ký tài khoản mới
 * - Đăng nhập
 * - Đăng xuất
 * - Refresh token
 * - Đổi mật khẩu
 * - Lấy thông tin user hiện tại
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Tạo Supabase client với user token
   * Dùng cho các operations cần user context
   */
  private createUserClient(accessToken: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseAnonKey = this.configService.get<string>('supabase.anonKey');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key must be provided');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Đăng ký tài khoản mới
   *
   * @param registerDto - Thông tin đăng ký (email, password, fullName)
   * @returns Thông tin user và session (access_token, refresh_token)
   */
  async register(registerDto: RegisterDto) {
    try {
      const { email, password, fullName } = registerDto;

      // Đăng ký user mới với Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new ConflictException('Email này đã được sử dụng');
        }
        throw new BadRequestException(error.message);
      }

      if (!data.user) {
        throw new BadRequestException('Không thể tạo tài khoản');
      }

      if (data.user.identities && data.user.identities.length === 0) {
        throw new ConflictException('Email này đã được sử dụng');
      }

      // Trả về thông tin user và session
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || fullName,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at,
        },
        session: data.session
          ? {
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              expiresAt: data.session.expires_at,
            }
          : null,
        message:
          'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      };
    } catch (error) {
      // Nếu đã là exception của NestJS thì throw lại
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Có lỗi xảy ra khi đăng ký: ' + error.message,
      );
    }
  }

  /**
   * Đăng nhập
   *
   * @param loginDto - Thông tin đăng nhập (email, password)
   * @returns Thông tin user và session (access_token, refresh_token)
   */
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Đăng nhập với Supabase Auth
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Kiểm tra các lỗi phổ biến
        if (error.message.includes('Invalid login credentials')) {
          throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new UnauthorizedException(
            'Vui lòng xác thực email trước khi đăng nhập',
          );
        }
        throw new UnauthorizedException(error.message);
      }

      if (!data.user || !data.session) {
        throw new UnauthorizedException('Đăng nhập thất bại');
      }

      // Trả về thông tin user và session
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || '',
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at,
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        },
        message: 'Đăng nhập thành công',
      };
    } catch (error) {
      // Nếu đã là exception của NestJS thì throw lại
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Có lỗi xảy ra khi đăng nhập: ' + error.message,
      );
    }
  }

  /**
   * Đăng xuất
   *
   * @param accessToken - Access token của user
   * @returns Thông báo đăng xuất thành công
   *
   * Lưu ý: Với Supabase, việc đăng xuất chủ yếu là invalidate token ở client side.
   * Token sẽ tự động hết hạn sau một thời gian. Ở server side, chúng ta chỉ cần
   * xác nhận rằng token đã được verify (qua AuthGuard) là đủ.
   */
  async logout(accessToken: string) {
    try {
      // Verify token trước khi logout
      const { error } = await this.supabase.auth.getUser(accessToken);

      if (error) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Với Supabase, token sẽ tự động expire
      // Client nên xóa token khỏi storage
      return {
        message: 'Đăng xuất thành công',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Có lỗi xảy ra khi đăng xuất: ' + error.message,
      );
    }
  }

  /**
   * Refresh token
   *
   * @param refreshTokenDto - Refresh token
   * @returns Session mới với access token và refresh token mới
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refreshToken } = refreshTokenDto;

      // Refresh token với Supabase
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new UnauthorizedException(
          'Refresh token không hợp lệ hoặc đã hết hạn',
        );
      }

      if (!data.session) {
        throw new UnauthorizedException('Không thể refresh token');
      }

      return {
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        },
        message: 'Refresh token thành công',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Có lỗi xảy ra khi refresh token: ' + error.message,
      );
    }
  }

  /**
   * Đổi mật khẩu
   *
   * @param userId - ID của user (từ @CurrentUser decorator)
   * @param changePasswordDto - Mật khẩu cũ và mới
   * @param accessToken - Access token của user
   * @returns Thông báo đổi mật khẩu thành công
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    accessToken: string,
  ) {
    try {
      const { oldPassword, newPassword } = changePasswordDto;

      // Tạo user client với token
      const userClient = this.createUserClient(accessToken);

      // Lấy thông tin user hiện tại
      const { data: userData, error: userError } =
        await userClient.auth.getUser();

      if (userError || !userData.user) {
        throw new UnauthorizedException('Không thể xác thực user');
      }

      // Kiểm tra mật khẩu cũ bằng cách thử đăng nhập với anon key
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseAnonKey =
        this.configService.get<string>('supabase.anonKey');
      const tempClient = createClient(supabaseUrl!, supabaseAnonKey!);

      const { error: signInError } = await tempClient.auth.signInWithPassword({
        email: userData.user.email!,
        password: oldPassword,
      });

      if (signInError) {
        throw new UnauthorizedException('Mật khẩu cũ không đúng');
      }

      // Đổi mật khẩu với user client
      const { error: updateError } = await userClient.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new BadRequestException(updateError.message);
      }

      return {
        message: 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Có lỗi xảy ra khi đổi mật khẩu: ' + error.message,
      );
    }
  }

  /**
   * Lấy thông tin user hiện tại
   *
   * @param accessToken - Access token của user
   * @returns Thông tin user
   */
  async getProfile(accessToken: string) {
    try {
      // Tạo Supabase client với token của user
      const { data, error } = await this.supabase.auth.getUser(accessToken);

      if (error || !data.user) {
        throw new UnauthorizedException('Không thể xác thực user');
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || '',
          phone: data.user.phone || '',
          avatar: data.user.user_metadata?.avatar || '',
          role: data.user.user_metadata?.role || '',
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at,
          emailVerified: data.user.email_confirmed_at !== null,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Có lỗi xảy ra khi lấy thông tin user: ' + error.message,
      );
    }
  }

  /**
   * Verify JWT token từ Supabase
   *
   * @param token - JWT token
   * @returns Thông tin user từ token
   */
  async verifyToken(token: string) {
    try {
      const { data, error } = await this.supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      return data.user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  /**
   * Xác thực email sau khi đăng ký
   * Hỗ trợ cả OTP code và token từ email link
   *
   * @param verifyEmailDto - Email và OTP/token để xác thực
   * @returns Thông tin user và session (nếu verify thành công)
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      const { email, otp, token } = verifyEmailDto;

      // Nếu có OTP code, verify bằng OTP
      if (otp) {
        const { data, error } = await this.supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email',
        });

        if (error) {
          if (error.message.includes('Invalid token')) {
            throw new UnauthorizedException('OTP không hợp lệ hoặc đã hết hạn');
          }
          throw new UnauthorizedException(error.message);
        }

        if (!data.user) {
          throw new UnauthorizedException('Xác thực email thất bại');
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || '',
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at,
            emailVerified: data.user.email_confirmed_at !== null,
          },
          session: data.session
            ? {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at,
              }
            : null,
          message: 'Xác thực email thành công',
        };
      }

      if (token) {
        const { data, error } = await this.supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });

        if (error) {
          if (error.message.includes('Invalid token')) {
            throw new UnauthorizedException(
              'Token không hợp lệ hoặc đã hết hạn',
            );
          }
          throw new UnauthorizedException(error.message);
        }

        if (!data.user) {
          throw new UnauthorizedException('Xác thực email thất bại');
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || '',
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at,
            emailVerified: data.user.email_confirmed_at !== null,
          },
          session: data.session
            ? {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at,
              }
            : null,
          message: 'Xác thực email thành công',
        };
      }

      throw new BadRequestException(
        'Vui lòng cung cấp OTP hoặc token để xác thực',
      );
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Có lỗi xảy ra khi xác thực email: ' + error.message,
      );
    }
  }
}
