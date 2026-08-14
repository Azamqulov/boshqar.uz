import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-1',
    phone: '+998901234567',
    fullName: 'Test User',
    passwordHash: '',
    status: 'active',
    isSuperAdmin: false,
    businessUsers: [
      {
        businessId: 'biz-1',
        branchId: 'branch-1',
        roleId: 'role-1',
        role: {
          name: 'owner',
          permissions: [{ permission: { action: 'all', module: 'all' } }],
        },
        business: {
          id: 'biz-1',
          name: 'Test Business',
          businessType: 'retail',
          status: 'active',
        },
      },
    ],
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('CorrectPassword123!', 10);
  });

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      rolePermission: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully log in with valid phone and password', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.login({
        login: '+998901234567',
        password: 'CorrectPassword123!',
      });

      expect(result).toHaveProperty('accessToken', 'mock-token');
      expect(result).toHaveProperty('refreshToken', 'mock-token');
      expect(result.user.phone).toBe('+998901234567');
      expect(result.activeBusiness?.id).toBe('biz-1');
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.login({
          login: '+998901234567',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          login: '+998999999999',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if phone is already registered', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.register({
          phone: '+998901234567',
          fullName: 'Duplicate User',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens when valid refresh token is provided', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refreshToken({ refreshToken: 'valid-refresh-token' });

      expect(result).toHaveProperty('accessToken', 'mock-token');
      expect(result).toHaveProperty('refreshToken', 'mock-token');
    });
  });

  describe('forgotPassword and resetPassword flow', () => {
    it('should create OTP and store in DB for forgotPassword', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.forgotPassword({ login: '+998901234567' });
      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should verify OTP and return resetToken', async () => {
      const userWithOtp = {
        ...mockUser,
        resetOtp: '123456',
        resetOtpExpiresAt: new Date(Date.now() + 60000),
      };
      prisma.user.findFirst.mockResolvedValue(userWithOtp);
      jwtService.signAsync.mockResolvedValue('valid-reset-token');

      const result = await service.verifyResetOtp({
        login: '+998901234567',
        otp: '123456',
      });

      expect(result.success).toBe(true);
      expect(result.resetToken).toBe('valid-reset-token');
    });

    it('should reset password and increment tokenVersion', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', type: 'password_reset' });
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.resetPassword({
        resetToken: 'valid-reset-token',
        newPassword: 'NewSecurePassword123!',
      });

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            tokenVersion: { increment: 1 },
            resetOtp: null,
            resetOtpExpiresAt: null,
          }),
        }),
      );
    });

    it('should change password and increment tokenVersion on changePassword', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.changePassword('user-1', {
        currentPassword: 'CorrectPassword123!',
        newPassword: 'BrandNewPassword123!',
      });

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            tokenVersion: { increment: 1 },
          }),
        }),
      );
    });
  });
});
