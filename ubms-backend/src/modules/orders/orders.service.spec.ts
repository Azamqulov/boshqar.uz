import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('OrdersService - Concurrency & Tenant Isolation', () => {
  let service: OrdersService;
  let prisma: any;

  const mockProduct = {
    id: 'prod-100',
    businessId: 'tenant-a',
    name: 'Lavash Standart',
    salePrice: 28000,
    status: 'active',
    brand: 'goods',
  };

  const mockInventory = {
    id: 'inv-100',
    businessId: 'tenant-a',
    branchId: 'branch-1',
    productId: 'prod-100',
    quantity: 10,
    reservedQty: 0,
  };

  beforeEach(async () => {
    prisma = {
      order: {
        count: jest.fn().mockResolvedValue(5),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      employee: {
        findFirst: jest.fn().mockResolvedValue({ id: 'emp-1' }),
      },
      product: {
        findUnique: jest.fn().mockResolvedValue(mockProduct),
      },
      service: {
        findUnique: jest.fn(),
      },
      inventory: {
        findUnique: jest.fn().mockResolvedValue(mockInventory),
        update: jest.fn(),
      },
      inventoryTransaction: {
        create: jest.fn(),
      },
      paymentMethod: {
        findFirst: jest.fn().mockResolvedValue({ id: 'pm-1', name: 'Naqd' }),
      },
      payment: {
        create: jest.fn(),
      },
      posShift: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      revenue: {
        create: jest.fn(),
      },
      customer: {
        update: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(prisma);
      }),
    };

    const mockTelegramService = {
      sendOrderNotification: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: TelegramService, useValue: mockTelegramService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should successfully create an order with atomic stock decrement', async () => {
    prisma.order.create.mockResolvedValue({
      id: 'order-1',
      orderNumber: '#0006',
      total: 56000,
      status: 'completed',
      items: [],
    });
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      orderNumber: '#0006',
      total: 56000,
      status: 'completed',
      items: [],
    });

    const dto: any = {
      branchId: 'branch-1',
      items: [{ productId: 'prod-100', quantity: 2, unitPrice: 28000 }],
      payments: [{ paymentMethodId: 'pm-1', amount: 56000 }],
    };

    const order = await service.create('tenant-a', 'branch-1', 'user-1', dto);
    expect(order).toBeDefined();
    expect(prisma.inventory.update).toHaveBeenCalledWith({
      where: { id: 'inv-100' },
      data: { quantity: 8 },
    });
    expect(prisma.inventoryTransaction.create).toHaveBeenCalled();
  });

  it('should throw ConflictException when stock is insufficient', async () => {
    prisma.inventory.findUnique.mockResolvedValue({
      ...mockInventory,
      quantity: 1, // Only 1 left
    });

    const dto: any = {
      branchId: 'branch-1',
      items: [{ productId: 'prod-100', quantity: 5 }], // Requesting 5
    };

    await expect(service.create('tenant-a', 'branch-1', 'user-1', dto)).rejects.toThrow(ConflictException);
  });
});
