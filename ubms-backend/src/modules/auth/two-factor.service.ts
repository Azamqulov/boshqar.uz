import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TwoFactorState {
  code: string;
  expiresAt: number;
  attempts: number;
}

@Injectable()
export class TwoFactorService {
  // In-memory / cache for 2FA verification codes
  private verificationCodes = new Map<string, TwoFactorState>();

  constructor(private prisma: PrismaService) {}

  /**
   * 6 xonali 2FA tasdiqlash kodini generatsiya qilish (3 daqiqa amal qiladi)
   */
  async generateCode(userId: string, targetPhoneOrTelegram: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes

    this.verificationCodes.set(userId, {
      code,
      expiresAt,
      attempts: 0,
    });

    // In production, sends via Telegram bot or SMS gateway
    return code;
  }

  /**
   * Kiritilgan 2FA kodini tekshirish
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const state = this.verificationCodes.get(userId);

    if (!state) {
      throw new BadRequestException('Tasdiqlash kodi topilmadi yoki muddati o\'tgan');
    }

    if (Date.now() > state.expiresAt) {
      this.verificationCodes.delete(userId);
      throw new BadRequestException('Tasdiqlash kodining amal qilish muddati tugagan');
    }

    state.attempts += 1;
    if (state.attempts > 5) {
      this.verificationCodes.delete(userId);
      throw new UnauthorizedException('Ko\'p marta noto\'g\'ri kod kiritildi. Qaytadan so\'rang.');
    }

    if (state.code !== code.trim()) {
      throw new BadRequestException('Noto\'g\'ri tasdiqlash kodi kiritildi');
    }

    // Success -> clean up
    this.verificationCodes.delete(userId);
    return true;
  }

  /**
   * Foydalanuvchining 2FA holatini tekshirish
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return !!(user as any)?.twoFactorEnabled;
  }
}
