import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDto } from "../../dto/register.dto";
import { VerifyEmailDto } from "../../dto/verify-email.dto";
import { OAuthLoginDto } from "../../dto/oauth-login.dto";
import { AuthBaseService } from "../auth-base.service";

interface OAuthUserInfo {
  email: string;
  name: string | null;
  avatar: string | null;
  providerId: string;
}

/**
 * Auth App Service
 *
 * Xử lý authentication cho Mobile App.
 * Kế thừa từ AuthBaseService và thêm các phương thức dành riêng cho App.
 */
@Injectable()
export class AuthAppService extends AuthBaseService {
  constructor(
    prisma: PrismaService,
    jwtService: JwtService,
    configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super(prisma, jwtService, configService);
  }

  /**
   * Đăng ký người dùng App (yêu cầu xác thực email bằng OTP)
   */
  async register(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing && existing.emailVerified) {
      throw new ConflictException("Email này đã được sử dụng");
    }

    const hashed = await this.hashPassword(password);
    const otp = this.generateOtp();
    const otpHash = await this.hashPassword(otp);
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    const user = existing
      ? await this.prisma.user.update({
          where: { email },
          data: {
            password: hashed,
            fullName,
            role: "USER",
            authProvider: "LOCAL",
            emailVerified: false,
            emailVerificationOtp: otpHash,
            emailVerificationExpires: expires,
          },
        })
      : await this.prisma.user.create({
          data: {
            email,
            password: hashed,
            fullName,
            role: "USER",
            authProvider: "LOCAL",
            emailVerified: false,
            emailVerificationOtp: otpHash,
            emailVerificationExpires: expires,
          },
        });

    await this.sendVerificationEmail(email, otp);

    return {
      user: this.sanitizeUser(user),
      session: null,
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.",
    };
  }

  /**
   * Xác thực email cho App
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp } = verifyEmailDto;
    if (!email) {
      throw new UnauthorizedException("Vui lòng cung cấp email để xác thực");
    }
    if (!otp) {
      throw new UnauthorizedException("Vui lòng cung cấp OTP để xác thực");
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Không tìm thấy user");
    }
    if (user.emailVerified) {
      return {
        user: this.sanitizeUser(user),
        session: null,
        message: "Email đã được xác thực",
      };
    }
    if (!user.emailVerificationOtp || !user.emailVerificationExpires) {
      throw new UnauthorizedException(
        "OTP không tồn tại, vui lòng đăng ký lại",
      );
    }
    if (user.emailVerificationExpires < new Date()) {
      throw new UnauthorizedException("OTP đã hết hạn, vui lòng đăng ký lại");
    }
    const match = await this.comparePassword(otp, user.emailVerificationOtp);
    if (!match) {
      throw new UnauthorizedException("OTP không hợp lệ");
    }

    const updated = await this.prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        emailVerificationOtp: null,
        emailVerificationExpires: null,
      },
    });
    const tokens = this.signTokens(updated);
    return {
      user: this.sanitizeUser(updated),
      session: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
      message: "Xác thực email thành công, tài khoản đã được kích hoạt",
    };
  }

  /**
   * Đăng nhập bằng OAuth (Google / Facebook)
   * Mobile app gửi token (idToken cho Google, accessToken cho Facebook)
   * Backend verify token → tìm/tạo user → trả về JWT session
   */
  async oauthLogin(oauthLoginDto: OAuthLoginDto) {
    const { token, provider } = oauthLoginDto;

    let userInfo: OAuthUserInfo;

    if (provider === "GOOGLE") {
      userInfo = await this.verifyGoogleToken(token);
    } else if (provider === "FACEBOOK") {
      userInfo = await this.verifyFacebookToken(token);
    } else {
      throw new UnauthorizedException("Provider không được hỗ trợ");
    }

    if (!userInfo.email) {
      throw new UnauthorizedException(
        "Không thể lấy email từ tài khoản " +
          provider +
          ". Vui lòng cấp quyền truy cập email.",
      );
    }

    // Tìm user theo email
    let user = await this.prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (user) {
      // User đã tồn tại → cập nhật provider info nếu chưa có
      if (!user.providerId || user.authProvider === "LOCAL") {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: provider,
            providerId: userInfo.providerId,
            avatar: user.avatar || userInfo.avatar,
            fullName: user.fullName || userInfo.name,
            emailVerified: true,
          },
        });
      }
    } else {
      // Tạo user mới (không cần password, emailVerified = true)
      user = await this.prisma.user.create({
        data: {
          email: userInfo.email,
          fullName: userInfo.name,
          avatar: userInfo.avatar,
          authProvider: provider,
          providerId: userInfo.providerId,
          emailVerified: true,
          role: "USER",
        },
      });
    }

    const tokens = this.signTokens(user);
    return {
      user: this.sanitizeUser(user),
      session: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
      message: "Đăng nhập thành công",
    };
  }

  /**
   * Verify Google idToken bằng Google tokeninfo API
   * Kiểm tra aud khớp với GOOGLE_CLIENT_ID_IOS hoặc GOOGLE_CLIENT_ID_ANDROID
   */
  private async verifyGoogleToken(idToken: string): Promise<OAuthUserInfo> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
        ),
      );

      const data = response.data;

      // Verify audience (aud) matches one of our client IDs
      const validClientIds = [
        this.configService.get<string>("GOOGLE_CLIENT_ID_IOS"),
        this.configService.get<string>("GOOGLE_CLIENT_ID_ANDROID"),
      ].filter(Boolean);

      if (validClientIds.length > 0 && !validClientIds.includes(data.aud)) {
        throw new UnauthorizedException(
          "Google token không hợp lệ: audience không khớp",
        );
      }

      return {
        email: data.email,
        name: data.name || null,
        avatar: data.picture || null,
        providerId: data.sub,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException(
        "Google token không hợp lệ hoặc đã hết hạn",
      );
    }
  }

  /**
   * Verify Facebook accessToken bằng Graph API
   */
  private async verifyFacebookToken(
    accessToken: string,
  ): Promise<OAuthUserInfo> {
    try {
      const appId = this.configService.get<string>("FACEBOOK_APP_ID");
      const appSecret = this.configService.get<string>("FACEBOOK_APP_SECRET");

      if (appId && appSecret) {
        const debugResponse = await firstValueFrom(
          this.httpService.get(
            `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`,
          ),
        );

        const debugData = debugResponse.data?.data;
        if (!debugData?.is_valid) {
          throw new UnauthorizedException("Facebook token không hợp lệ");
        }
      }

      // Bước 2: Lấy thông tin user từ Graph API
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`,
        ),
      );

      const data = response.data;

      return {
        email: data.email,
        name: data.name || null,
        avatar: data.picture?.data?.url || null,
        providerId: data.id,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException(
        "Facebook token không hợp lệ hoặc đã hết hạn",
      );
    }
  }

  formatResponse(result: any) {
    if (!result) return result;

    const formatted: any = {
      message: result.message,
    };

    if (result.user) {
      formatted.user = this.formatUser(result.user);
    }

    if (result.session) {
      formatted.session = result.session;
    }

    return formatted;
  }

  formatUser(user: any) {
    if (!user) return user;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
      emailVerified: user.emailVerified ?? false,
    };
  }
}
