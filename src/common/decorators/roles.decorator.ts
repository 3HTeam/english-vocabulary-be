import { SetMetadata } from '@nestjs/common';

/**
 * Roles Decorator
 *
 * Use this decorator to specify which roles are allowed to access a route.
 * Must be used together with RolesGuard.
 *
 * @example
 * @Roles('admin')
 * @Get('admin-only')
 * adminOnlyRoute() { ... }
 *
 * @example
 * @Roles('admin', 'moderator')
 * @Get('admin-or-moderator')
 * adminOrModeratorRoute() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
