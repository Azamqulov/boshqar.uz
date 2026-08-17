import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  businessId?: string;
  branchId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(_req: TenantRequest, _res: Response, next: NextFunction) {
    // Verified tenant & branch identification is strictly enforced by JwtStrategy
    next();
  }
}
