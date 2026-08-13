import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, businessId, body, ip } = request;

    return next.handle().pipe(
      tap(async (responseBody) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && user?.userId && businessId) {
          try {
            const pathParts = url.split('?')[0].split('/').filter(Boolean);
            const entity = pathParts[2] || pathParts[1] || 'general';
            const action = method.toLowerCase();

            await this.prisma.auditLog.create({
              data: {
                businessId,
                userId: user.userId,
                action,
                entity,
                entityId: responseBody?.id || null,
                newValue: body ? JSON.parse(JSON.stringify(body)) : null,
                ipAddress: ip || request.headers['x-forwarded-for'] || null,
              },
            });
          } catch (err) {
            console.error('Audit log creation failed:', err);
          }
        }
      }),
    );
  }
}
