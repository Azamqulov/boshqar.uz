import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Foydalanuvchi to\'liq ismi', example: 'Alisher Qodirov' })
  @IsString()
  @IsNotEmpty({ message: 'Ism sharifingizni kiriting' })
  fullName: string;

  @ApiProperty({ description: 'Telefon raqami (+998...)', example: '+998901234567' })
  @IsString()
  @IsNotEmpty({ message: 'Telefon raqam majburiy' })
  phone: string;

  @ApiPropertyOptional({ description: 'Elektron pochta manzili', example: 'alisher@boshqar.uz' })
  @IsEmail({}, { message: 'Email formati noto\'g\'ri' })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Parol (kamida 4 ta belgi)', example: '1234' })
  @IsString()
  @MinLength(4, { message: 'Parol kamida 4 ta belgidan iborat bo\'lishi shart' })
  password: string;

  @ApiPropertyOptional({ description: 'Telegram orqali olingan OTP kod', example: '123456' })
  @IsOptional()
  @IsString()
  otp?: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Telefon raqami yoki email', example: '+998901234567' })
  @IsString()
  @IsNotEmpty({ message: 'Telefon raqam yoki email kiriting' })
  login: string;

  @ApiProperty({ description: 'Parol', example: '1234' })
  @IsString()
  @IsNotEmpty({ message: 'Parolni kiriting' })
  password: string;

  @ApiPropertyOptional({ description: 'Tanlangan biznes ID', example: '00000000-0000-0000-0000-000000000001' })
  @IsOptional()
  @IsString()
  businessId?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT Refresh token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token majburiy' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Telefon raqami yoki email', example: '+998901234567' })
  @IsString()
  @IsNotEmpty({ message: 'Telefon yoki email kiriting' })
  login: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'Telefon raqami yoki email', example: '+998901234567' })
  @IsString()
  @IsNotEmpty({ message: 'Telefon yoki email kiriting' })
  login: string;

  @ApiProperty({ description: 'Tasdiqlash kodi', example: '123456' })
  @IsString()
  @IsNotEmpty({ message: 'Tasdiqlash kodini kiriting' })
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'OTP tasdiqlangandan so\'ng berilgan tiklash tokeni' })
  @IsString()
  @IsNotEmpty({ message: 'Tiklash tokeni talab qilinadi' })
  resetToken: string;

  @ApiProperty({ description: 'Yangi parol (kamida 4 ta belgi)', example: '1234' })
  @IsString()
  @MinLength(4, { message: 'Yangi parol kamida 4 ta belgidan iborat bo\'lishi shart' })
  newPassword: string;
}
