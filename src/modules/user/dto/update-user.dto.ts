import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Họ tên người dùng' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Ảnh đại diện' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'ID cấp độ hiện tại' })
  @IsOptional()
  @IsUUID()
  levelId?: string;

  @ApiPropertyOptional({ description: 'Cấp độ mục tiêu' })
  @IsOptional()
  @IsString()
  targetLevel?: string;

  @ApiPropertyOptional({ description: 'Mục tiêu học hàng ngày' })
  @IsOptional()
  @IsInt()
  @Min(1)
  dailyGoal?: number;

  @ApiPropertyOptional({ description: 'Xác thực email' })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
