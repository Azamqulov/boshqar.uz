import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AiService', () => {
  let service: AiService;
  let prisma: PrismaService;

  const mockPrismaService = {
    business: {
      findUnique: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    expense: {
      findMany: jest.fn(),
    },
    inventory: {
      findMany: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
    },
    posShift: {
      findMany: jest.fn(),
    },
    product: {
      count: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    unit: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processQuery', () => {
    it('should respond to business questions with intelligent response', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: 'bus-1',
        name: 'Test Do\'kon',
        currency: 'UZS',
      });
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.expense.findMany.mockResolvedValue([]);
      mockPrismaService.inventory.findMany.mockResolvedValue([]);
      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.posShift.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(15);

      const response = await service.processQuery(
        { query: 'Bugungi savdo qanday?' },
        'user-1',
        'bus-1',
      );

      expect(response).toBeDefined();
      expect(response).toHaveProperty('answer');
      expect(typeof response.answer).toBe('string');
    });

    it('should provide navigation action route when asking about POS kassa', async () => {
      const response = await service.processQuery(
        { query: 'Kassaga qanday o\'taman?' },
        'user-1',
        'bus-1',
      );

      expect(response).toBeDefined();
      expect(response.actionRoute).toBe('/pos');
    });
  });
});
