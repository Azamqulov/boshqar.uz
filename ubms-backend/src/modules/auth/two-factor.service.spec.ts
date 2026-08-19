import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorService } from './two-factor.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('TwoFactorService', () => {
  let service: TwoFactorService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCode & verifyCode', () => {
    it('6 xonali kod generatsiya qilishi va to\'g\'ri kiritilganda tasdiqlashi kerak', async () => {
      const code = await service.generateCode('user-1', '+998901234567');
      expect(code).toHaveLength(6);

      const isValid = await service.verifyCode('user-1', code);
      expect(isValid).toBe(true);
    });

    it('noto\'g\'ri kod kiritilganda BadRequestException tashlashi kerak', async () => {
      await service.generateCode('user-1', '+998901234567');

      await expect(service.verifyCode('user-1', '000000')).rejects.toThrow(BadRequestException);
    });

    it('5 martadan ko\'p noto\'g\'ri urinish bo\'lsa bloklashi (UnauthorizedException) kerak', async () => {
      await service.generateCode('user-1', '+998901234567');

      for (let i = 0; i < 5; i++) {
        try {
          await service.verifyCode('user-1', '000000');
        } catch (e) {}
      }

      await expect(service.verifyCode('user-1', '000000')).rejects.toThrow(UnauthorizedException);
    });
  });
});
