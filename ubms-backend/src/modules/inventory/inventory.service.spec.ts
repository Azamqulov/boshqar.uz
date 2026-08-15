import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('InventoryService - Pagination & Stock Operations', () => {
  let service: InventoryService;
  let prisma: any;

  const mockInventoryItem = {
    id: 'inv-1',
    businessId: 'tenant-a',
    branchId: 'branch-1',
    productId: 'prod-1',
    quantity: 100,
    reservedQty: 10,
    product: {
      name: 'Shirinlik',
      sku: 'SKU-1',
      barcode: '12345',
      purchasePrice: 5000,
      salePrice: 8000,
      minStock: 20,
      category: { name: 'Shirinliklar' },
      unit: { shortName: 'dona' },
    },
    branch: { name: 'Bosh Filial' },
  };

  beforeEach(async () => {
    prisma = {
      inventory: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      inventoryTransaction: {
        create: jest.fn(),
      },
      product: {
        update: jest.fn(),
      },
      supplier: {
        update: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(prisma);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should return paginated inventory with meta information', async () => {
    prisma.inventory.findMany.mockResolvedValue([mockInventoryItem]);
    prisma.inventory.count.mockResolvedValue(1);

    const result = await service.getInventory('tenant-a', 'branch-1', { page: 1, limit: 50 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);
  });

  it('should throw BadRequestException when stocking in invalid quantity', async () => {
    await expect(
      service.stockIn('tenant-a', 'branch-1', 'user-1', { productId: 'prod-1', quantity: 0 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException when stocking out more than available stock', async () => {
    prisma.inventory.findUnique.mockResolvedValue({
      id: 'inv-1',
      quantity: 5,
    });

    await expect(
      service.stockOut('tenant-a', 'branch-1', 'user-1', { productId: 'prod-1', quantity: 10, reason: 'damage' }),
    ).rejects.toThrow(ConflictException);
  });
});
