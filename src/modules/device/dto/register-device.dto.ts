import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Platform, PushTokenType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RegisterDeviceDto {
  @ApiPropertyOptional({
    description: "Push notification token (Expo/FCM/APNs)",
    example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  })
  @IsOptional()
  @IsString()
  pushToken?: string;

  @ApiPropertyOptional({
    description: "Type of push token",
    enum: PushTokenType,
    example: "expo",
  })
  @IsOptional()
  @IsEnum(PushTokenType)
  pushTokenType?: PushTokenType;

  @ApiProperty({
    description: "Device platform",
    enum: Platform,
    example: "ios",
  })
  @IsNotEmpty()
  @IsEnum(Platform)
  platform: Platform;

  @ApiPropertyOptional({
    description: "Device name (e.g., iPhone 15 Pro, Samsung Galaxy S24)",
    example: "iPhone 15 Pro",
  })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({
    description: "Device model code (e.g., iPhone16,1, SM-S928B)",
    example: "iPhone16,1",
  })
  @IsOptional()
  @IsString()
  deviceModel?: string;

  @ApiPropertyOptional({
    description: "Device brand (e.g., Apple, Samsung, Xiaomi)",
    example: "Apple",
  })
  @IsOptional()
  @IsString()
  deviceBrand?: string;

  @ApiPropertyOptional({
    description: "OS version (e.g., iOS 17.2, Android 14)",
    example: "17.2",
  })
  @IsOptional()
  @IsString()
  osVersion?: string;

  @ApiPropertyOptional({
    description: "App version",
    example: "1.0.0",
  })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiPropertyOptional({
    description: "App build number",
    example: "100",
  })
  @IsOptional()
  @IsString()
  appBuildNumber?: string;
}
