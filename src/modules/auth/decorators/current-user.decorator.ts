import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator @CurrentUser()
 *
 * Sử dụng decorator này trong controller để lấy thông tin user hiện tại
 * User info được attach vào request bởi AuthGuard
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: any) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
