import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Ism sharifingizni kiriting' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Telefon raqam majburiy' })
  phone: string;

  @IsEmail({}, { message: 'Email formati noto\'g\'ri' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8, { message: 'Parol kamida 8 ta belgidan iborat bo\'lishi shart' })
  password: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Telefon raqam yoki email kiriting' })
  login: string;

  @IsString()
  @IsNotEmpty({ message: 'Parolni kiriting' })
  password: string;

  @IsOptional()
  @IsString()
  businessId?: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token majburiy' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Telefon yoki email kiriting' })
  login: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @MinLength(8, { message: 'Yangi parol kamida 8 ta belgidan iborat bo\'lishi shart' })
  newPassword: string;
}
