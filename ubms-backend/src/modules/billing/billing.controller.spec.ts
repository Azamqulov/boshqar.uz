import { Test, TestingModule } from '@nestjs/testing';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('BillingController', () => {
  let controller: BillingController;
  let service: BillingService;

  const mockBillingService = {
    getRequisites: jest.fn(),
    updateRequisites: jest.fn(),
    getTenantBillingStatus: jest.fn(),
    submitBillingRequest: jest.fn(),
    getAllBillingRequests: jest.fn(),
    approveBillingRequest: jest.fn(),
    rejectBillingRequest: jest.fn(),
    deleteBillingRequest: jest.fn(),
  };

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        {
          provide: BillingService,
          useValue: mockBillingService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<BillingController>(BillingController);
    service = module.get<BillingService>(BillingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRequisites', () => {
    it('to\'lov rekvizitlarini olishi kerak', async () => {
      const mockReq = { cardNumber: '8600 0000 0000 0000', cardHolder: 'BOSHQAR UZ ADMIN' };
      mockBillingService.getRequisites.mockResolvedValue(mockReq);

      const res = await controller.getRequisites();
      expect(res).toEqual(mockReq);
      expect(mockBillingService.getRequisites).toHaveBeenCalled();
    });
  });

  describe('getTenantStatus', () => {
    it('CurrentBusinessId orqali statusni so\'rashi kerak', async () => {
      const mockStatus = { activeSubscription: null, planLimits: {} };
      mockBillingService.getTenantBillingStatus.mockResolvedValue(mockStatus);

      const res = await controller.getTenantStatus('biz-1');
      expect(res).toEqual(mockStatus);
      expect(mockBillingService.getTenantBillingStatus).toHaveBeenCalledWith('biz-1');
    });
  });

  describe('submitRequest', () => {
    it('CurrentBusinessId orqali to\'lov so\'rovini yuborishi kerak', async () => {
      const dto = {
        planId: 'plan-pro',
        durationMonths: 1,
        receiptUrl: 'https://example.com/receipt.jpg',
      };
      const mockCreated = { id: 'req-1', ...dto, status: 'pending' };
      mockBillingService.submitBillingRequest.mockResolvedValue(mockCreated);

      const res = await controller.submitRequest('biz-1', dto);
      expect(res).toEqual(mockCreated);
      expect(mockBillingService.submitBillingRequest).toHaveBeenCalledWith('biz-1', dto);
    });
  });

  describe('approveRequest', () => {
    it('SuperAdmin tomonidan so\'rovni tasdiqlashi kerak', async () => {
      const mockApproved = { success: true, request: { id: 'req-1', status: 'approved' } };
      mockBillingService.approveBillingRequest.mockResolvedValue(mockApproved);

      const mockReq = { user: { userId: 'admin-1' } };
      const res = await controller.approveRequest('req-1', mockReq, 30, undefined);
      expect(res).toEqual(mockApproved);
      expect(mockBillingService.approveBillingRequest).toHaveBeenCalledWith('req-1', 'admin-1', 30, undefined);
    });
  });
});
