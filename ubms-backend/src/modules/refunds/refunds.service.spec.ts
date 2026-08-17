import { Test, TestingModule } from '@nestjs/testing';
import { RefundsService } from './refunds.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RefundsService', () => {
  let service: RefundsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    refund: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    inventory: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    inventoryTransaction: {
      create: jest.fn(),
    },
    refundItem: {
      createMany: jest.fn(),
    },
    revenue: {
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RefundsService>(RefundsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('buyurtma topilmasa NotFoundException tashlashi kerak', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(
        service.create('biz-1', 'user-1', {
          orderId: 'invalid-order',
          reason: 'Buzilgan',
          items: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('yakunlanmagan (draft/cancelled) buyurtma uchun BadRequestException tashlashi kerak', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue({
        id: 'o1',
        businessId: 'biz-1',
        status: 'draft',
        items: [],
      });

      await expect(
        service.create('biz-1', 'user-1', {
          orderId: 'o1',
          reason: 'Buzilgan',
          items: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('muvaffaqiyatli qaytarishda ombor qoldig\'i tiklanishi va refund yozuvi yaratilishi kerak', async () => {
      const mockOrder = {
        id: 'o1',
        businessId: 'biz-1',
        branchId: 'br-1',
        status: 'completed',
        items: [
          {
            id: 'oi-1',
            productId: 'p-1',
            quantity: 2,
            unitPrice: 50000,
            discountAmount: 0,
          },
        ],
      };
      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);
      mockPrismaService.inventory.findUnique.mockResolvedValue({
        id: 'inv-1',
        quantity: 10,
      });
      mockPrismaService.refund.create.mockResolvedValue({
        id: 'ref-1',
        orderId: 'o1',
        totalRefundAmount: 50000,
        status: 'completed',
      });
      mockPrismaService.revenue.create.mockResolvedValue({});

      const result = await service.create('biz-1', 'user-1', {
        orderId: 'o1',
        reason: 'Mijoz qaytardi',
        items: [{ orderItemId: 'oi-1', quantity: 1 }],
      });

      expect(result.id).toBe('ref-1');
      expect(mockPrismaService.inventory.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { quantity: 11 },
      });
      expect(mockPrismaService.inventoryTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'in',
            reason: 'refund',
            quantity: 1,
            quantityBefore: 10,
            quantityAfter: 11,
          }),
        }),
      );
    });
  });
});
