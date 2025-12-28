import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { User } from '@prisma/client';

/**
 * Auth Service
 *
 * JWT + Prisma + bcrypt (stateless).
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async createMailer() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    if (!host || !user || !pass) {
      throw new BadRequestException(
        'SMTP configuration is missing (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)',
      );
    }
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private async sendVerificationEmail(email: string, otp: string) {
    const transporter = await this.createMailer();
    const from =
      this.configService.get<string>('SMTP_FROM') || 'no-reply@example.com';
    const appName = this.configService.get<string>('APP_NAME') || 'Our App';
    const subject = `${appName} - Xác thực tài khoản`;

    let html: string | undefined;
    try {
      const srcPath = resolve(
        process.cwd(),
        'src',
        'modules',
        'auth',
        'templates',
        'email-verification.html',
      );
      const distPath = resolve(
        process.cwd(),
        'dist',
        'modules',
        'auth',
        'templates',
        'email-verification.html',
      );

      let templatePath: string;
      try {
        readFileSync(srcPath, 'utf8');
        templatePath = srcPath;
      } catch {
        templatePath = distPath;
      }

      const raw = readFileSync(templatePath, 'utf8');
      html = raw.replace('{{ .Token }}', otp);
    } catch (e) {
      html = `
        <p>Xin chào,</p>
        <p>Mã OTP xác thực tài khoản của bạn là: <b>${otp}</b></p>
        <p>Mã có hiệu lực trong 5 phút.</p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      `;
    }

    await transporter.sendMail({
      to: email,
      from,
      subject,
      html,
    });
  }

  private generateOtp(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds =
      Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS')) || 10;
    return bcrypt.hash(password, rounds);
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private getAccessTokenExpiresIn(): string | number {
    return this.configService.get<string>('JWT_EXPIRES_IN') || '3600s';
  }

  private getRefreshTokenExpiresIn(): string | number {
    return this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';
  }

  /**
   * Tính thời gian hết hạn của access token (timestamp)
   */
  private calculateAccessTokenExpiresAt(): Date {
    const expiresIn = this.getAccessTokenExpiresIn();
    let expiresInMs: number;

    if (typeof expiresIn === 'number') {
      expiresInMs = expiresIn * 1000; // seconds to ms
    } else {
      // Parse string like '3600s', '1h', '7d'
      const match = expiresIn.match(/^(\d+)(s|m|h|d)?$/);
      if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2] || 's';
        switch (unit) {
          case 'd':
            expiresInMs = value * 24 * 60 * 60 * 1000;
            break;
          case 'h':
            expiresInMs = value * 60 * 60 * 1000;
            break;
          case 'm':
            expiresInMs = value * 60 * 1000;
            break;
          case 's':
          default:
            expiresInMs = value * 1000;
            break;
        }
      } else {
        // Default to 1 hour
        expiresInMs = 3600 * 1000;
      }
    }

    return new Date(Date.now() + expiresInMs);
  }

  private signTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessOptions: JwtSignOptions = {
      expiresIn: this.getAccessTokenExpiresIn() as JwtSignOptions['expiresIn'],
    };
    const refreshOptions: JwtSignOptions = {
      expiresIn: this.getRefreshTokenExpiresIn() as JwtSignOptions['expiresIn'],
    };
    const accessToken = this.jwtService.sign(payload, accessOptions);
    const refreshToken = this.jwtService.sign(payload, refreshOptions);
    const expiresAt = this.calculateAccessTokenExpiresAt();
    return { accessToken, refreshToken, expiresAt };
  }

  private sanitizeUser(user: User) {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName || '',
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Đăng ký người dùng App (yêu cầu xác thực email bằng OTP)
   */
  async registerApp(registerDto: RegisterDto) {
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

    await this.sendVerificationEmail(email, otp);

    return {
      user: this.sanitizeUser(user),
      session: null,
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.',
    };
  }

  /**
   * Đăng ký Admin (yêu cầu xác thực email bằng OTP)
   */
  async registerAdmin(registerDto: RegisterDto) {
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
            role: 'admin',
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
            role: 'admin',
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
        'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Tài khoản chưa xác thực email. Vui lòng kiểm tra email để kích hoạt.',
      );
    }

    const match = await this.comparePassword(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const tokens = this.signTokens(user);
    return {
      user: this.sanitizeUser(user),
      session: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
      message: 'Đăng nhập thành công',
    };
  }

  async logout(_accessToken: string) {
    return { message: 'Đăng xuất thành công' };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User không tồn tại');
      }
      const tokens = this.signTokens(user);
      return {
        session: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        },
        message: 'Refresh token thành công',
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    _accessToken: string,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }
    const match = await this.comparePassword(oldPassword, user.password);
    if (!match) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }
    const hashed = await this.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { message: 'Đổi mật khẩu thành công' };
  }

  async getProfile(accessToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User không tồn tại');
      }
      return { user: this.sanitizeUser(user) };
    } catch (error) {
      throw new UnauthorizedException(
        'Có lỗi xảy ra khi lấy thông tin user: ' + error.message,
      );
    }
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

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

  formatAdminResponse(result: any) {
    if (!result) return result;

    const formatted: any = {
      message: result.message,
    };

    if (result.user) {
      formatted.user = this.formatAdminUser(result.user);
    }

    if (result.session) {
      formatted.session = result.session;
    }

    return formatted;
  }

  formatAdminUser(user: any) {
    if (!user) return user;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role || '',
      emailVerified: user.emailVerified ?? false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  formatAppResponse(result: any) {
    if (!result) return result;

    const formatted: any = {
      message: result.message,
    };

    if (result.user) {
      formatted.user = this.formatAppUser(result.user);
    }

    if (result.session) {
      formatted.session = result.session;
    }

    return formatted;
  }

  formatAppUser(user: any) {
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
