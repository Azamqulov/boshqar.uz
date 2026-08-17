import { Test, TestingModule } from '@nestjs/testing';
import { FiscalService } from './fiscal.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('FiscalService', () => {
  let service: FiscalService;
  let prisma: PrismaService;

  const mockPrismaService = {
    order: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    posShift: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiscalService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FiscalService>(FiscalService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFiscalReceipt', () => {
    it('mavjud bo\'lmagan buyurtma uchun NotFoundException tashlashi kerak', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.generateFiscalReceipt('biz-1', 'invalid-order')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('tugallanmagan buyurtma uchun BadRequestException tashlashi kerak', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue({
        id: 'ord-1',
        status: 'draft',
      });

      await expect(service.generateFiscalReceipt('biz-1', 'ord-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('to\'g\'ri fiskal rekvizitlar va Soliq.uz QR havolasini yaratishi kerak', async () => {
      const mockOrder = {
        id: 'ord-1',
        businessId: 'biz-1',
        status: 'completed',
        total: 112000,
        createdAt: new Date('2026-08-17T12:00:00Z'),
        business: { id: 'biz-1', name: 'Test Supermarket' },
        items: [
          {
            id: 'item-1',
            quantity: 1,
            unitPrice: 112000,
            total: 112000,
            product: { name: 'Shakar 1kg', sku: '12345678901234567' },
          },
        ],
        payments: [{ paymentMethod: { type: 'card' }, amount: 112000 }],
      };
      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.generateFiscalReceipt('biz-1', 'ord-1');
      expect(result.companyName).toBe('Test Supermarket');
      expect(result.totalAmount).toBe(112000);
      expect(result.totalVatAmount).toBe(12000); // 112000 * 12 / 112 = 12000
      expect(result.qrCodeUrl).toContain('https://ofd.soliq.uz/check?');
      expect(result.items[0].ikpu).toBe('12345678901234567');
    });
  });

  describe('getZReport', () => {
    it('smena bo\'yicha kunlik Z-hisobot summasi va QQSni hisoblashi kerak', async () => {
      const mockShift = { id: 'shift-1', businessId: 'biz-1', status: 'closed', openedAt: new Date() };
      mockPrismaService.posShift.findFirst.mockResolvedValue(mockShift);
      mockPrismaService.order.findMany.mockResolvedValue([
        {
          id: 'ord-1',
          total: 112000,
          payments: [{ paymentMethod: { type: 'cash' }, amount: 112000 }],
        },
      ]);

      const result = await service.getZReport('biz-1', 'shift-1');
      expect(result.totalSales).toBe(112000);
      expect(result.totalCash).toBe(112000);
      expect(result.totalVat).toBe(12000);
      expect(result.totalReceipts).toBe(1);
    });
  });
});
