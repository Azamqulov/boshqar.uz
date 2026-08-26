import { PerformanceInterceptor } from './performance.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('PerformanceInterceptor', () => {
  let interceptor: PerformanceInterceptor;

  beforeEach(() => {
    interceptor = new PerformanceInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should intercept execution and add X-Response-Time header', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/api/v1/health', originalUrl: '/api/v1/health' }),
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: () => of({ status: 'ok' }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({ status: 'ok' });
        expect(mockSetHeader).toHaveBeenCalledWith('X-Response-Time', expect.stringMatching(/ms$/));
        done();
      },
    });
  });
});
