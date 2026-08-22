import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TelegramService } from '../telegram/telegram.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    business: {
      create: jest.fn(),
    },
    businessUser: {
      create: jest.fn(),
    },
    branch: {
      create: jest.fn(),
    },
    plan: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    verify: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  const mockTelegramService = {
    sendVerificationCode: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: TelegramService,
          useValue: mockTelegramService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('telefon raqami allaqachon mavjud bo\'lsa ConflictException tashlashi kerak', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          phone: '+998901234567',
          fullName: 'Baxrom Admin',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('foydalanuvchi topilmasa UnauthorizedException tashlashi kerak', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          login: '+998901234567',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('parol noto\'g\'ri kiritilsa UnauthorizedException tashlashi kerak', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'user-1',
        phone: '+998901234567',
        passwordHash: hashedPassword,
        isActive: true,
      });

      await expect(
        service.login({
          login: '+998901234567',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('to\'g\'ri parol kiritilganda JWT token va foydalanuvchi ma\'lumotlarini qaytarishi kerak', async () => {
      const plainPassword = 'correctpassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'user-1',
        phone: '+998901234567',
        fullName: 'Baxrom Admin',
        passwordHash: hashedPassword,
        isActive: true,
        status: 'active',
        isSuperAdmin: false,
        businessUsers: [
          {
            role: 'OWNER',
            business: {
              id: 'biz-1',
              name: 'Super Market',
              status: 'active',
              businessType: 'RETAIL',
              plan: { name: 'Pro' },
              branches: [{ id: 'br-1', name: 'Asosiy filial', isMain: true }],
            },
          },
        ],
      });

      const result = await service.login({
        login: '+998901234567',
        password: plainPassword,
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.phone).toBe('+998901234567');
      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });
  });
});
