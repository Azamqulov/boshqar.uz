import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto';
import { mapPermModulesToUiModules, extractActionPermissions } from '../employees/employees.service';
import * as bcrypt from 'bcrypt';

function normalizePhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  const last9 = digits.length >= 9 ? digits.slice(-9) : digits;
  return '+998' + last9;
}

interface LoginAttemptRecord {
  failedAttempts: number;
  lockoutCount: number;
  lockedUntil: number | null;
}

@Injectable()
export class AuthService {
  private loginAttempts = new Map<string, LoginAttemptRecord>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private getLockoutDurationMinutes(lockoutCount: number): number {
    if (lockoutCount === 1) return 3;
    if (lockoutCount === 2) return 5;
    if (lockoutCount === 3) return 10;
    if (lockoutCount === 4) return 15;
    return 15 + (lockoutCount - 4) * 5;
  }

  async register(dto: RegisterDto) {
    const cleanPhone = normalizePhone(dto.phone);
    const last9 = cleanPhone.replace(/\D/g, '').slice(-9);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: { endsWith: last9 } },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException({
        code: 'USER_EXISTS',
        message: 'Ushbu telefon raqam bilan allaqachon hisob ochilgan. Iltimos, Kirish tugmasi orqali kiring.',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        phone: cleanPhone,
        email: dto.email || null,
        passwordHash,
        status: 'active',
      },
    });

    const tokens = await this.generateTokens(user.id);
    return {
      ...tokens,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  async login(dto: LoginDto) {
    const cleanLogin = normalizePhone(dto.login);
    const rawDigits = cleanLogin.replace(/\D/g, '');

    // Check if currently locked out
    const attemptRecord = this.loginAttempts.get(cleanLogin) || {
      failedAttempts: 0,
      lockoutCount: 0,
      lockedUntil: null,
    };

    if (attemptRecord.lockedUntil && attemptRecord.lockedUntil > Date.now()) {
      const remainingSeconds = Math.ceil((attemptRecord.lockedUntil - Date.now()) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      throw new UnauthorizedException({
        code: 'ACCOUNT_LOCKED',
        message: `Xavfsizlik yuzasidan tizim bloklangan. Iltimos, ${remainingMinutes} daqiqa (${remainingSeconds} soniya) kuting.`,
        remainingSeconds,
        lockoutCount: attemptRecord.lockoutCount,
      });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanLogin },
          { phone: dto.login },
          { phone: rawDigits },
          { phone: { contains: rawDigits.length >= 9 ? rawDigits.substring(rawDigits.length - 9) : rawDigits } },
          { email: dto.login },
        ],
      },
      include: {
        businessUsers: {
          include: {
            business: true,
            role: true,
            branch: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'Ushbu telefon raqam bilan hisob topilmadi. Iltimos, ro\'yxatdan o\'ting.',
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      attemptRecord.failedAttempts += 1;

      if (attemptRecord.failedAttempts >= 3) {
        attemptRecord.lockoutCount += 1;
        const lockMinutes = this.getLockoutDurationMinutes(attemptRecord.lockoutCount);
        const lockSeconds = lockMinutes * 60;
        attemptRecord.lockedUntil = Date.now() + lockSeconds * 1000;
        attemptRecord.failedAttempts = 0; // reset for next round
        this.loginAttempts.set(cleanLogin, attemptRecord);

        throw new UnauthorizedException({
          code: 'ACCOUNT_LOCKED',
          message: `3 marta xato parol kiritildi! Xavfsizlik yuzasidan tizim ${lockMinutes} daqiqaga bloklandi.`,
          remainingSeconds: lockSeconds,
          lockoutCount: attemptRecord.lockoutCount,
        });
      } else {
        this.loginAttempts.set(cleanLogin, attemptRecord);
        const attemptsLeft = 3 - attemptRecord.failedAttempts;
        throw new UnauthorizedException({
          code: 'INVALID_PASSWORD',
          message: `Kiritilgan parol noto'g'ri. Qolgan urinishlar: ${attemptsLeft} ta.`,
          attemptsLeft,
          failedAttempts: attemptRecord.failedAttempts,
        });
      }
    }

    // Password is valid - reset lock & attempts
    this.loginAttempts.delete(cleanLogin);

    if (user.status !== 'active') {
      throw new UnauthorizedException({
        code: 'ACCOUNT_BLOCKED',
        message: 'Sizning akkauntingiz bloklangan. Administratorga murojaat qiling.',
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const activeBusiness = dto.businessId
      ? user.businessUsers.find((bu) => bu.businessId === dto.businessId)
      : user.businessUsers[0];

    const tokens = await this.generateTokens(
      user.id,
      activeBusiness?.businessId,
      activeBusiness?.branchId || undefined,
      activeBusiness?.roleId,
    );

    let allowedModules: string[] = [];
    let actionPermissions: Record<string, { create: boolean; edit: boolean; delete: boolean }> = {
      pos: { create: true, edit: true, delete: true },
      products: { create: true, edit: true, delete: true },
      inventory: { create: true, edit: true, delete: true },
      customers: { create: true, edit: true, delete: true },
      suppliers: { create: true, edit: true, delete: true },
      finance: { create: true, edit: true, delete: true },
    };

    if (activeBusiness?.role.name === 'Owner' || user.isSuperAdmin) {
      allowedModules = ['all'];
    } else if (activeBusiness?.roleId) {
      const rolePerms = await this.prisma.rolePermission.findMany({
        where: { roleId: activeBusiness.roleId },
        include: { permission: true },
      });
      const perms = rolePerms.map((rp) => rp.permission.module);
      allowedModules = mapPermModulesToUiModules(perms);
      actionPermissions = extractActionPermissions(rolePerms);
      if (allowedModules.length === 0) {
        const lower = (activeBusiness.role.name || '').toLowerCase();
        if (lower.includes('waiter') || lower.includes('ofitsiant')) allowedModules = ['tables', 'pos'];
        else if (lower.includes('cook') || lower.includes('oshpaz')) allowedModules = ['kds'];
        else if (lower.includes('cashier') || lower.includes('kassir') || lower.includes('sotuvchi')) allowedModules = ['pos', 'products', 'customers'];
        else allowedModules = ['pos', 'products'];
      }
    }

    return {
      ...tokens,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        isSuperAdmin: user.isSuperAdmin,
      },
      activeBusiness: activeBusiness
        ? {
            id: activeBusiness.business.id,
            name: activeBusiness.business.name,
            businessType: activeBusiness.business.businessType,
            role: activeBusiness.role.name,
            branchId: activeBusiness.branchId,
            allowedModules,
            actionPermissions,
          }
        : null,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_SECRET!,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          businessUsers: {
            include: {
              business: true,
              role: true,
            },
          },
        },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Foydalanuvchi topilmadi yoki bloklangan' });
      }

      const activeBusiness = user.businessUsers[0];

      return this.generateTokens(
        user.id,
        activeBusiness?.businessId,
        activeBusiness?.branchId || undefined,
        activeBusiness?.roleId,
      );
    } catch {
      throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Refresh token yaroqsiz yoki muddati o\'tgan' });
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const cleanLogin = normalizePhone(dto.login);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanLogin },
          { phone: dto.login },
          { email: dto.login },
        ],
      },
    });

    if (!user) {
      return { success: true, message: 'Agar foydalanuvchi mavjud bo\'lsa, tiklash kodi yuborildi' };
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp,
        resetOtpExpiresAt,
      },
    });

    console.log(`[SMS-AUTH] Parolni tiklash kodi (${user.phone}): ${resetOtp}`);

    return {
      success: true,
      message: 'Parolni tiklash kodi SMS orqali yuborildi',
      devOtp: process.env.NODE_ENV !== 'production' ? resetOtp : undefined,
    };
  }

  async verifyResetOtp(dto: VerifyOtpDto) {
    const cleanLogin = normalizePhone(dto.login);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanLogin },
          { phone: dto.login },
          { email: dto.login },
        ],
      },
    });

    if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
      throw new BadRequestException({ code: 'INVALID_OTP', message: 'Tasdiqlash kodi topilmadi yoki eskirgan' });
    }

    if (new Date() > user.resetOtpExpiresAt) {
      throw new BadRequestException({ code: 'EXPIRED_OTP', message: 'Tasdiqlash kodining amal qilish muddati tugagan' });
    }

    if (user.resetOtp !== dto.otp.trim()) {
      throw new BadRequestException({ code: 'INVALID_OTP', message: 'Tasdiqlash kodi noto\'g\'ri' });
    }

    // Generate short-lived reset token (15 mins)
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'password_reset' },
      { secret: process.env.JWT_SECRET!, expiresIn: '15m' },
    );

    return {
      success: true,
      resetToken,
      message: 'Kod tasdiqlandi. Yangi parolni kiriting.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(dto.resetToken, {
        secret: process.env.JWT_SECRET!,
      });

      if (payload.type !== 'password_reset') {
        throw new BadRequestException({ code: 'INVALID_TOKEN', message: 'Tiklash tokeni yaroqsiz' });
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new BadRequestException({ code: 'USER_NOT_FOUND', message: 'Foydalanuvchi topilmadi' });
      }

      if (!dto.newPassword || dto.newPassword.length < 6) {
        throw new BadRequestException({ code: 'WEAK_PASSWORD', message: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
      }

      const passwordHash = await bcrypt.hash(dto.newPassword, 10);

      // Update password, increment tokenVersion (revoking old sessions), and clear OTP
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          tokenVersion: { increment: 1 },
          resetOtp: null,
          resetOtpExpiresAt: null,
        },
      });

      return { success: true, message: 'Parol muvaffaqiyatli yangilandi. Yangi parol bilan tizimga kiring.' };
    } catch {
      throw new BadRequestException({ code: 'INVALID_TOKEN', message: 'Parolni tiklash havolasi yaroqsiz yoki muddati tugagan' });
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        avatarUrl: true,
        isSuperAdmin: true,
        status: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Foydalanuvchi topilmadi' });
    return user;
  }

  async updateProfile(userId: string, dto: { fullName?: string; phone?: string; email?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Foydalanuvchi topilmadi' });
    }

    if (dto.phone && dto.phone !== user.phone) {
      const clean = normalizePhone(dto.phone);
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: clean } });
      if (existingPhone && existingPhone.id !== userId) {
        throw new ConflictException({ code: 'PHONE_EXISTS', message: 'Ushbu telefon raqami allaqachon ro\'yxatdan o\'tgan' });
      }
      dto.phone = clean;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName !== undefined ? dto.fullName : user.fullName,
        phone: dto.phone !== undefined ? dto.phone : user.phone,
        email: dto.email !== undefined ? dto.email : user.email,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        avatarUrl: true,
        isSuperAdmin: true,
      },
    });

    return updatedUser;
  }

  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Foydalanuvchi topilmadi' });
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException({ code: 'INVALID_CURRENT_PASSWORD', message: 'Amaldagi parol noto\'g\'ri kiritildi' });
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestException({ code: 'WEAK_PASSWORD', message: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    // Increment tokenVersion to revoke other existing active sessions
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 },
      },
    });

    return { success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' };
  }

  private async generateTokens(
    userId: string,
    businessId?: string,
    branchId?: string,
    roleId?: string,
  ) {
    let permissions: string[] = [];

    const [rolePerms, dbUser] = await Promise.all([
      roleId
        ? this.prisma.rolePermission.findMany({
            where: { roleId },
            include: { permission: true },
          })
        : Promise.resolve([]),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { tokenVersion: true },
      }),
    ]);

    if (rolePerms.length > 0) {
      permissions = rolePerms.map((rp) => rp.permission.code);
    }

    const tokenVersion = dbUser?.tokenVersion || 1;

    const payload = {
      sub: userId,
      businessId,
      branchId,
      roleId,
      permissions,
      tokenVersion,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET!,
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET!,
        expiresIn: '30d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  async demoGuestSession(dto: { companyName?: string; phone?: string; businessType?: string }) {
    const demoPhone = '+998900000000';
    const compName = dto.companyName?.trim() || 'Baraka Market';
    const bType = (dto.businessType as any) || 'shop';
    const realPhone = dto.phone?.trim() || '+998 (Noma\'lum)';

    // 🎯 SuperAdmin uchun har bir demo hisob ochuvchini DemoLead sifatida saqlash
    try {
      await this.prisma.demoLead.create({
        data: {
          companyName: compName,
          phone: realPhone,
          businessType: bType,
          status: 'new',
        },
      });
    } catch (e) {
      console.warn('DemoLead saqlashda xatolik:', e);
    }

    let user = await this.prisma.user.findFirst({
      where: { phone: demoPhone },
      include: {
        businessUsers: {
          include: {
            business: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      const passwordHash = await bcrypt.hash('DemoPass123!', 10);
      user = await this.prisma.user.create({
        data: {
          fullName: compName,
          phone: demoPhone,
          email: 'demo@boshqar.uz',
          passwordHash,
          status: 'active',
        },
        include: {
          businessUsers: {
            include: {
              business: true,
              role: true,
            },
          },
        },
      });
    }

    let activeBusiness = user.businessUsers[0];

    if (!activeBusiness) {
      const defaultPlan = await this.prisma.plan.findFirst();
      const planId = defaultPlan?.id || '';

      let ownerRole = await this.prisma.role.findFirst({
        where: { name: 'Owner' },
      });

      const newBiz = await this.prisma.business.create({
        data: {
          name: compName,
          businessType: bType,
          ownerId: user.id,
          planId: planId,
          currency: 'UZS',
          timezone: 'Asia/Tashkent',
          status: 'trial',
        },
      });

      const mainBranch = await this.prisma.branch.create({
        data: {
          businessId: newBiz.id,
          name: 'Asosiy Filial',
          isMain: true,
          status: 'active',
        },
      });

      if (!ownerRole) {
        ownerRole = await this.prisma.role.create({
          data: {
            businessId: newBiz.id,
            name: 'Owner',
          },
        });
      }

      const bu = await this.prisma.businessUser.create({
        data: {
          userId: user.id,
          businessId: newBiz.id,
          branchId: mainBranch.id,
          roleId: ownerRole.id,
        },
        include: {
          business: true,
          role: true,
        },
      });

      activeBusiness = bu;
    } else {
      await this.prisma.business.update({
        where: { id: activeBusiness.businessId },
        data: {
          name: compName,
          businessType: bType,
        },
      });
      activeBusiness.business.name = compName;
      activeBusiness.business.businessType = bType;
    }

    const tokens = await this.generateTokens(
      user.id,
      activeBusiness.businessId,
      activeBusiness.branchId || undefined,
      activeBusiness.roleId,
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: compName,
        isSuperAdmin: false,
      },
      activeBusiness: {
        id: activeBusiness.business.id,
        name: compName,
        businessType: bType,
        currency: activeBusiness.business.currency || 'UZS',
        role: 'Owner',
        branchId: activeBusiness.branchId,
        allowedModules: ['all'],
        actionPermissions: {
          pos: { create: true, edit: true, delete: true },
          products: { create: true, edit: true, delete: true },
          inventory: { create: true, edit: true, delete: true },
          customers: { create: true, edit: true, delete: true },
          suppliers: { create: true, edit: true, delete: true },
          finance: { create: true, edit: true, delete: true },
        },
      },
      businesses: [
        {
          id: activeBusiness.business.id,
          name: compName,
          businessType: bType,
          currency: activeBusiness.business.currency || 'UZS',
          role: 'Owner',
          branchId: activeBusiness.branchId,
          allowedModules: ['all'],
        },
      ],
    };
  }
}

