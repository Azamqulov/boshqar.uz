import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BillingService', () => {
  let service: BillingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    plan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    business: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    businessUser: {
      count: jest.fn(),
    },
    branch: {
      count: jest.fn(),
    },
    systemSetting: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    paymentRequisite: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
    billingRequest: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRequisites', () => {
    it('standart rekvizitlar yoki saqlangan rekvizitlarni qaytarishi kerak', async () => {
      mockPrismaService.systemSetting.findUnique.mockResolvedValue(null);
      const res = await service.getRequisites();
      expect(res.cardNumber).toBe('8600 0000 0000 0000');
      expect(res.cardHolder).toBe('BOSHQAR UZ ADMIN');
    });
  });

  describe('submitBillingRequest', () => {
    it('mavjud bo\'lmagan tarif tanlansa xatolik (NotFoundException) tashlashi kerak', async () => {
      mockPrismaService.plan.findUnique.mockResolvedValue(null);

      await expect(
        service.submitBillingRequest('biz-1', {
          planId: 'invalid-plan',
          durationMonths: 1,
          receiptUrl: 'https://example.com/receipt.jpg',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('Free tarif uchun to\'lov so\'rovi yaratishga urinilsa BadRequestException tashlashi kerak', async () => {
      mockPrismaService.plan.findUnique.mockResolvedValue({
        id: 'plan-free',
        name: 'Free',
        priceMonthly: 0,
      });

      await expect(
        service.submitBillingRequest('biz-1', {
          planId: 'plan-free',
          durationMonths: 1,
          receiptUrl: 'https://example.com/receipt.jpg',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('12 oylik tanlovda 15% chegirma to\'g\'ri hisoblanishi va so\'rov yaratilishi kerak', async () => {
      const proPlan = {
        id: 'plan-pro',
        name: 'Pro',
        priceMonthly: 200000,
      };
      mockPrismaService.plan.findUnique.mockResolvedValue(proPlan);
      mockPrismaService.billingRequest.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'req-123', ...data }),
      );

      const result = await service.submitBillingRequest('biz-1', {
        planId: 'plan-pro',
        durationMonths: 12,
        receiptUrl: 'https://example.com/receipt.jpg',
        senderName: 'Ali Valiyev',
      });

      // 200,000 * 12 = 2,400,000; 15% discount = 360,000; Final = 2,040,000
      expect(result.amount).toBe(2040000);
      expect(result.status).toBe('pending');
      expect(mockPrismaService.billingRequest.create).toHaveBeenCalled();
    });
  });

  describe('approveBillingRequest', () => {
    it('to\'lov so\'rovi tasdiqlanganda obuna muddati to\'g\'ri yangilanishi kerak', async () => {
      const mockReq = {
        id: 'req-1',
        businessId: 'biz-1',
        planId: 'plan-pro',
        durationMonths: 1,
        status: 'pending',
        amount: 199000,
        business: { id: 'biz-1', name: 'Test Market' },
        plan: { id: 'plan-pro', name: 'Pro' },
      };
      mockPrismaService.billingRequest.findUnique.mockResolvedValue(mockReq);
      mockPrismaService.billingRequest.update.mockResolvedValue({
        ...mockReq,
        status: 'approved',
      });
      mockPrismaService.business.update.mockResolvedValue({});
      mockPrismaService.subscription.upsert.mockResolvedValue({});

      const result = await service.approveBillingRequest('req-1', 'admin-1', 30);
      expect(result.success).toBe(true);
      expect(result.request.status).toBe('approved');
      expect(mockPrismaService.subscription.create).toHaveBeenCalled();
      expect(mockPrismaService.business.update).toHaveBeenCalled();
    });
  });
});
