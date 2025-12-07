import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { SUPABASE_CLIENT } from 'src/database/database.constants';

/**
 * Auth Guard
 *
 * Guard này sẽ:
 * 1. Kiểm tra xem route có được đánh dấu là @Public() không
 * 2. Nếu không phải public, sẽ verify JWT token từ header Authorization
 * 3. Nếu token hợp lệ, sẽ attach user info vào request để dùng trong controller
 *
 * Cách sử dụng:
 * - Thêm @UseGuards(AuthGuard) vào controller hoặc route
 * - Hoặc set global guard trong main.ts
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Kiểm tra xem route có được đánh dấu là public không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu là public route thì không cần check auth
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token chưa được cung cấp');
    }

    try {
      // Verify token với Supabase
      const { data, error } = await this.supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Attach user info vào request để dùng trong controller
      // Có thể dùng @CurrentUser() decorator để lấy
      request['user'] = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || '',
        createdAt: data.user.created_at,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
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
