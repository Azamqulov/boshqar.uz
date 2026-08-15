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
      tap((responseBody) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && user?.userId && businessId) {
          // Asynchronously record audit log in background so user gets immediate response
          setImmediate(async () => {
            try {
              const pathParts = url.split('?')[0].split('/').filter(Boolean);
              const entity = pathParts[2] || pathParts[1] || 'general';
              const action = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
              let clientIp = ip || request.headers['x-forwarded-for'] || request.socket?.remoteAddress || '127.0.0.1';
              if (typeof clientIp === 'string') {
                if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
                  clientIp = '127.0.0.1';
                } else if (clientIp.startsWith('::ffff:')) {
                  clientIp = clientIp.replace('::ffff:', '');
                }
              }

              await this.prisma.auditLog.create({
                data: {
                  businessId,
                  userId: user.userId,
                  action,
                  entity,
                  entityId: responseBody?.id || null,
                  newValue: body ? JSON.parse(JSON.stringify(body)) : null,
                  ipAddress: typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : '127.0.0.1',
                },
              });
            } catch (err) {
              console.error('Audit log background creation failed:', err);
            }
          });
        }
      }),
    );
  }
}
