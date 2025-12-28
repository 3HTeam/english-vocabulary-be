import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { AuthBaseService } from './auth-base.service';

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
      throw new ConflictException('Email này đã được sử dụng');
    }

    const hashed = await this.hashPassword(password);
    const otp = this.generateOtp();
    const otpHash = await this.hashPassword(otp);
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    const user = existing
      ? await this.prisma.user.update({
          where: { email },
          data: {
            password: hashed,
            fullName,
            role: 'user',
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
            role: 'user',
            emailVerified: false,
            emailVerificationOtp: otpHash,
            emailVerificationExpires: expires,
          },
        });

    this.sendVerificationEmail(email, otp).catch((err) => {
      console.error('Failed to send verification email:', err.message);
    });

    return {
      user: this.sanitizeUser(user),
      session: null,
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.',
    };
  }

  /**
   * Xác thực email cho App
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp } = verifyEmailDto;
    if (!email) {
      throw new BadRequestException('Vui lòng cung cấp email để xác thực');
    }
    if (!otp) {
      throw new BadRequestException('Vui lòng cung cấp OTP để xác thực');
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }
    if (user.emailVerified) {
      return {
        user: this.sanitizeUser(user),
        session: null,
        message: 'Email đã được xác thực',
      };
    }
    if (!user.emailVerificationOtp || !user.emailVerificationExpires) {
      throw new UnauthorizedException(
        'OTP không tồn tại, vui lòng đăng ký lại',
      );
    }
    if (user.emailVerificationExpires < new Date()) {
      throw new UnauthorizedException('OTP đã hết hạn, vui lòng đăng ký lại');
    }
    const match = await this.comparePassword(otp, user.emailVerificationOtp);
    if (!match) {
      throw new UnauthorizedException('OTP không hợp lệ');
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
      message: 'Xác thực email thành công, tài khoản đã được kích hoạt',
    };
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
      fullName: user.fullName || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      emailVerified: user.emailVerified ?? false,
    };
  }
}
