import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/custom.decorator';
import { CurrentUser } from '../../common/decorators/context.decorator';

@ApiTags('Autentifikatsiya (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Ro\'yxatdan o\'tish uchun Telegram OTP yuborish' })
  @Post('send-register-otp')
  @HttpCode(HttpStatus.OK)
  sendRegisterOtp(@Body('phone') phone: string) {
    return this.authService.sendRegisterOtp(phone);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 urinish / daqiqa
  @ApiOperation({ summary: 'Yangi foydalanuvchini ro\'yxatdan o\'tkazish' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Tizimga kirish (Login)' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 demo session / daqiqa (DDoS himoyasi)
  @ApiOperation({ summary: '1-bosqichli Demo mehmon seansi yaratish' })
  @Post('demo-guest')
  @HttpCode(HttpStatus.OK)
  demoGuest(@Body() dto: { companyName?: string; phone?: string; businessType?: string }) {
    return this.authService.demoGuestSession(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 urinish / daqiqa (rate limiting)
  @ApiOperation({ summary: 'Access tokenni yangilash (Refresh)' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 urinish / daqiqa
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 urinish / daqiqa
  @Post('verify-reset-otp')
  @HttpCode(HttpStatus.OK)
  verifyResetOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 urinish / daqiqa
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { success: true, message: 'Tizimdan muvaffaqiyatli chiqildi' };
  }

  @Get('profile/me')
  getProfile(@CurrentUser('userId') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('profile/me')
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: { fullName?: string; phone?: string; email?: string },
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser('userId') userId: string,
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
