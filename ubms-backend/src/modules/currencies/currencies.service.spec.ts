import { Test, TestingModule } from '@nestjs/testing';
import { CurrenciesService } from './currencies.service';

describe('CurrenciesService', () => {
  let service: CurrenciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrenciesService],
    }).compile();

    service = module.get<CurrenciesService>(CurrenciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should convert same currency with 1:1 rate', () => {
    const res = service.convert(100, 'USD', 'USD');
    expect(res.result).toBe(100);
    expect(res.rate).toBe(1);
  });

  it('should convert USD to UZS correctly using fallback or CBU rate', () => {
    const res = service.convert(10, 'USD', 'UZS');
    expect(res.result).toBeGreaterThanOrEqual(110000); // 10 * 11937.89 = 119378.90
    expect(res.from).toBe('USD');
    expect(res.to).toBe('UZS');
  });

  it('should convert UZS to USD correctly', () => {
    const res = service.convert(119378.90, 'UZS', 'USD');
    expect(res.result).toBeCloseTo(10, 0);
    expect(res.from).toBe('UZS');
    expect(res.to).toBe('USD');
  });

  it('should convert USD to RUB through base rate', () => {
    const res = service.convert(100, 'USD', 'RUB');
    expect(res.result).toBeGreaterThan(0);
    expect(res.from).toBe('USD');
    expect(res.to).toBe('RUB');
  });

  it('should return all rates including USD, EUR, RUB', async () => {
    // Spy or use internal rates without waiting for slow external network in tests
    jest.spyOn(service, 'fetchCbuRates').mockImplementation(async () => {
      (service as any).ensureFallbackRates();
      return (service as any).cachedRates;
    });

    const data = await service.getRates();
    expect(data.success).toBe(true);
    expect(data.baseCurrency).toBe('UZS');
    expect(data.mainRates.USD).toBeDefined();
    expect(data.mainRates.EUR).toBeDefined();
    expect(data.mainRates.RUB).toBeDefined();
  });
});
