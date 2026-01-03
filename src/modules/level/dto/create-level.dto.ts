import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({
    description: 'Tên cấp độ',
    example: 'Beginner',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Mã cấp độ',
    example: 'A1',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'Mô tả cấp độ',
    example: 'Cấp độ A1',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự cấp độ',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái cấp độ',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
