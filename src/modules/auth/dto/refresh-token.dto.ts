import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO cho refresh token
 *
 * @example
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
export class RefreshTokenDto {
  @IsString({ message: 'Refresh token phải là chuỗi' })
  @IsNotEmpty({ message: 'Refresh token là bắt buộc' })
  refreshToken: string;
}
