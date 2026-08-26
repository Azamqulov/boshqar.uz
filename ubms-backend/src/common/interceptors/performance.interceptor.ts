import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const start = performance.now();
    const method = req.method;
    const url = req.originalUrl || req.url;

    return next.handle().pipe(
      tap(() => {
        const duration = Math.round((performance.now() - start) * 100) / 100;
        
        // Expose high-precision response time header to client
        if (res && typeof res.setHeader === 'function') {
          res.setHeader('X-Response-Time', `${duration}ms`);
        }

        if (duration > 200) {
          this.logger.warn(`⚠️ SLOW REQUEST: [${method}] ${url} took ${duration}ms (Threshold: 200ms)`);
        } else {
          this.logger.debug(`⚡ [${method}] ${url} took ${duration}ms`);
        }
      }),
    );
  }
}
