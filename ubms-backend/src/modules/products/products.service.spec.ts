import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductsService - Tenant Isolation', () => {
  let service: ProductsService;
  let prisma: any;

  const mockProductTenantA = {
    id: 'prod-1',
    businessId: 'tenant-a',
    name: 'Coca Cola 1.5L',
    sku: 'PRD-000001',
    barcode: '4780001234567',
    salePrice: 12000,
    costPrice: 9000,
    status: 'active',
    inventory: [{ quantity: 50, reservedQty: 0 }],
  };

  const mockProductTenantB = {
    id: 'prod-2',
    businessId: 'tenant-b',
    name: 'Pepsi 1.5L',
    sku: 'PRD-000002',
    barcode: '4780009876543',
    salePrice: 11500,
    costPrice: 8500,
    status: 'active',
    inventory: [{ quantity: 30, reservedQty: 0 }],
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should find product for the owning tenant', async () => {
    prisma.product.findFirst.mockImplementation(({ where }: any) => {
      if (where.id === 'prod-1' && where.businessId === 'tenant-a') {
        return Promise.resolve(mockProductTenantA);
      }
      return Promise.resolve(null);
    });

    const result = await service.findOne('tenant-a', 'prod-1');
    expect(result).toBeDefined();
    expect(result.id).toBe('prod-1');
    expect(result.businessId).toBe('tenant-a');
  });

  it('should throw NotFoundException when Tenant B tries to access Tenant A product (Cross-Tenant Leak Prevention)', async () => {
    prisma.product.findFirst.mockImplementation(({ where }: any) => {
      if (where.id === 'prod-1' && where.businessId === 'tenant-b') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });

    await expect(service.findOne('tenant-b', 'prod-1')).rejects.toThrow(NotFoundException);
  });

  it('should only return products belonging to requesting tenant in findAll()', async () => {
    prisma.product.findMany.mockImplementation(({ where }: any) => {
      if (where.businessId === 'tenant-a') {
        return Promise.resolve([mockProductTenantA]);
      }
      return Promise.resolve([]);
    });
    prisma.product.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-a');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].businessId).toBe('tenant-a');
  });
});
