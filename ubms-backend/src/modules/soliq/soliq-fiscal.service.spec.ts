import { SoliqFiscalService } from './soliq-fiscal.service';

describe('SoliqFiscalService Unit Tests', () => {
  let service: SoliqFiscalService;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      order: {
        findFirst: jest.fn(),
      },
      soliqFiscalReceipt: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new SoliqFiscalService(mockPrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fiscalize a completed POS order and return Soliq QR code URL', async () => {
    const mockOrder = {
      id: 'order-uuid-12345678',
      businessId: 'business-uuid-1234',
      total: 150000,
      items: [{ id: 'item-1', name: 'Non', price: 5000, quantity: 2 }],
    };

    const mockCreatedReceipt = {
      id: 'receipt-uuid-999',
      businessId: 'business-uuid-1234',
      orderId: 'order-uuid-12345678',
      fiscalSign: 'UZSOLIQ-12345678-ORDER-1234',
      qrCodeUrl: 'https://soliq.uz/check?sign=UZSOLIQ-12345678-ORDER-1234&terminal=VK-UZ-889012&sum=150000',
      terminalId: 'VK-UZ-889012',
      receiptSeq: BigInt(1001),
      status: 'SUCCESS',
      createdAt: new Date(),
    };

    mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);
    mockPrismaService.soliqFiscalReceipt.findUnique.mockResolvedValue(null);
    mockPrismaService.soliqFiscalReceipt.create.mockResolvedValue(mockCreatedReceipt);

    const result = await service.fiscalizeOrder('business-uuid-1234', { orderId: 'order-uuid-12345678' });

    expect(result).toBeDefined();
    expect(result.status).toBe('SUCCESS');
    expect(result.qrCodeUrl).toContain('soliq.uz/check');
    expect(result.terminalId).toBe('VK-UZ-889012');
  });

  it('should throw NotFoundException if order does not exist', async () => {
    mockPrismaService.order.findFirst.mockResolvedValue(null);

    await expect(
      service.fiscalizeOrder('business-uuid-1234', { orderId: 'non-existent-order' }),
    ).rejects.toThrow();
  });
});
