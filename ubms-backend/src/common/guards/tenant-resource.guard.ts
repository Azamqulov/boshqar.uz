import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantResourceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Autentifikatsiyadan o\'tilmagan (User payload missing)');
    }

    // SuperAdmin has global bypass permissions
    if (user.isSuperAdmin) {
      return true;
    }

    const tenantIdFromReq = request.params.tenantId || request.body.tenantId || request.query.tenantId;

    if (tenantIdFromReq && tenantIdFromReq !== user.businessId) {
      throw new ForbiddenException('Taqiqlangan amal: Boshqa korxona resursiga kirishga ruxsat yo\'q (IDOR Violation)');
    }

    return true;
  }
}
