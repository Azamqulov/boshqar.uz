import { Test, TestingModule } from '@nestjs/testing';
import { TerminalIntegrationService } from './terminal-integration.service';

describe('TerminalIntegrationService', () => {
  let service: TerminalIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TerminalIntegrationService],
    }).compile();

    service = module.get<TerminalIntegrationService>(TerminalIntegrationService);
  });

  it('Uzcard terminal to\'lovini muvaffaqiyatli qayta ishlashi kerak', async () => {
    const res = await service.processTerminalPayment({
      amount: 150000,
      orderNumber: 'ORD-1001',
      terminalType: 'uzcard',
    });

    expect(res.success).toBe(true);
    expect(res.amount).toBe(150000);
    expect(res.panMasked).toContain('8600');
    expect(res.rrn).toBeDefined();
  });

  it('Humo terminal to\'lovida 9860 karta raqami qaytishi kerak', async () => {
    const res = await service.processTerminalPayment({
      amount: 80000,
      orderNumber: 'ORD-1002',
      terminalType: 'humo',
    });

    expect(res.success).toBe(true);
    expect(res.panMasked).toContain('9860');
  });
});
