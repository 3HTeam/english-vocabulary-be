import { ApiProperty } from '@nestjs/swagger';

/**
 * Auth App Response DTO
 *
 * Response DTO cho Mobile App - chỉ bao gồm thông tin cần thiết
 * Không bao gồm các thông tin nhạy cảm hoặc admin-only fields
 */
export class AuthAppResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Full name', required: false })
  fullName?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  avatar?: string;

  @ApiProperty({ description: 'Whether email is verified' })
  emailVerified: boolean;
}

export class SessionAppResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token expiration timestamp' })
  expiresAt: number;
}
