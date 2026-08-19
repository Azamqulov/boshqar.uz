import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminTenantsService } from './super-admin-tenants.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SuperAdminTenantsService', () => {
  let service: SuperAdminTenantsService;
  let prisma: any;

  const mockBusiness = {
    id: 'biz-1',
    name: "Do'kon Express",
    planId: 'plan-pro',
    status: 'active',
    branches: [{ id: 'br-1', name: 'Asosiy' }],
    plan: { id: 'plan-pro', name: 'pro', maxProducts: 5000 },
    _count: { products: 45, orders: 150, employees: 3 },
  };

  const mockUser = {
    id: 'owner-1',
    fullName: 'Azam Qulov',
    phone: '+998901234567',
    email: 'azam@boshqar.uz',
    role: 'owner',
    status: 'active',
    isSuperAdmin: false,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    ownedBusinesses: [mockBusiness],
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([mockUser]),
        findUnique: jest.fn().mockResolvedValue(mockUser),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockResolvedValue({ ...mockUser, status: 'inactive' }),
      },
      business: {
        findMany: jest.fn().mockResolvedValue([mockBusiness]),
        findUnique: jest.fn().mockResolvedValue(mockBusiness),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({ ...mockBusiness, planId: 'plan-pro' }),
      },
      plan: {
        findUnique: jest.fn().mockResolvedValue({ id: 'plan-pro', name: 'pro', maxProducts: 5000 }),
      },
      subscription: {
        create: jest.fn().mockResolvedValue({ id: 'sub-1' }),
      },
      order: {
        count: jest.fn().mockResolvedValue(150),
        aggregate: jest.fn().mockResolvedValue({ _sum: { total: 45000000 } }),
        groupBy: jest.fn().mockResolvedValue([{ businessId: 'biz-1', _sum: { total: 45000000 } }]),
      },
      product: {
        count: jest.fn().mockResolvedValue(45),
      },
      employee: {
        count: jest.fn().mockResolvedValue(3),
      },
      $transaction: jest.fn().mockImplementation(async (arg) => {
        if (Array.isArray(arg)) return Promise.all(arg);
        if (typeof arg === 'function') return arg(prisma);
        return arg;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminTenantsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SuperAdminTenantsService>(SuperAdminTenantsService);
  });

  it('should list owners with business summary and stats', async () => {
    const result = await service.getOwners('test');
    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.items[0].fullName).toBe('Azam Qulov');
  });

  it('should toggle owner active status', async () => {
    const updated = await service.updateOwnerStatus('owner-1', 'inactive');
    expect(updated.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('should update business subscription plan', async () => {
    const updated = await service.updateBusinessPlan('biz-1', 'plan-pro');
    expect(updated).toBeDefined();
    expect(prisma.business.update).toHaveBeenCalled();
  });

  it('should throw NotFoundException if owner does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.getOwnerStats('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
