import { Test, TestingModule } from '@nestjs/testing';
import { FiscalService } from './fiscal.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FiscalService', () => {
  let service: FiscalService;
  let prisma: PrismaService;

  const mockPrismaService = {
    order: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    soliqFiscalReceipt: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
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
    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.generateFiscalReceipt('biz-1', 'invalid-order')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should generate Soliq OFD QR code and fiscal sign for valid order', async () => {
      const mockOrder = {
        id: 'ord-1',
        businessId: 'biz-1',
        total: 100000,
        items: [],
      };
      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);
      mockPrismaService.soliqFiscalReceipt.findUnique.mockResolvedValue(null);
      mockPrismaService.soliqFiscalReceipt.create.mockResolvedValue({
        id: 'rec-1',
        businessId: 'biz-1',
        orderId: 'ord-1',
        fiscalSign: 'OFD-123456789012',
        qrCodeUrl: 'https://ofd.soliq.uz/check?t=ST12345&s=OFD-123456789012&a=100000',
        terminalId: 'TER-SOLIQ-001',
        receiptSeq: BigInt(1234567),
        status: 'SUCCESS',
      });

      const result = await service.generateFiscalReceipt('biz-1', 'ord-1');
      expect(result.fiscalSign).toContain('OFD-');
      expect(result.qrCodeUrl).toContain('https://ofd.soliq.uz/check?');
    });
  });

  describe('getZReport', () => {
    it('should calculate Z-report totals for business', async () => {
      mockPrismaService.soliqFiscalReceipt.count.mockResolvedValue(5);
      mockPrismaService.order.findMany.mockResolvedValue([
        { total: 100000 },
        { total: 200000 },
      ]);

      const result = await service.getZReport('biz-1');
      expect(result.totalReceipts).toBe(5);
      expect(result.totalRevenue).toBe(300000);
      expect(result.totalTax).toBe(36000);
    });
  });
});
