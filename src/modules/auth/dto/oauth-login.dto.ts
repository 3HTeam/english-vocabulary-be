import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEnum } from "class-validator";

export class OAuthLoginDto {
  @ApiProperty({
    description:
      "Token từ OAuth provider (idToken cho Google, accessToken cho Facebook)",
    example: "eyJhbGciOiJSUzI1NiIs...",
  })
  @IsString({ message: "Token phải là chuỗi" })
  @IsNotEmpty({ message: "Token là bắt buộc" })
  token: string;

  @ApiProperty({
    description: "OAuth provider",
    enum: ["GOOGLE", "FACEBOOK"],
    example: "GOOGLE",
  })
  @IsEnum(
    { GOOGLE: "GOOGLE", FACEBOOK: "FACEBOOK" },
    {
      message: "Provider phải là GOOGLE hoặc FACEBOOK",
    },
  )
  @IsNotEmpty({ message: "Provider là bắt buộc" })
  provider: "GOOGLE" | "FACEBOOK";
}
