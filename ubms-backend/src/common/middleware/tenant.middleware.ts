import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  businessId?: string;
  branchId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, _res: Response, next: NextFunction) {
    const businessIdHeader = req.headers['x-business-id'] as string;
    const branchIdHeader = req.headers['x-branch-id'] as string;

    if (businessIdHeader) {
      req.businessId = businessIdHeader;
    }
    if (branchIdHeader) {
      req.branchId = branchIdHeader;
    }

    next();
  }
}
