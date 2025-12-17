import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Auth Guard (JWT)
 *
 * - Bypass nếu route được đánh dấu @Public()
 * - Verify JWT từ Authorization header
 * - Lấy user từ DB để đảm bảo user còn tồn tại
 * - Attach user vào request (dùng @CurrentUser())
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token chưa được cung cấp');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User không tồn tại hoặc đã bị khóa');
      }

      request['user'] = {
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

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  /**
   * Extract JWT token từ Authorization header
   * Format: "Bearer <token>"
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
