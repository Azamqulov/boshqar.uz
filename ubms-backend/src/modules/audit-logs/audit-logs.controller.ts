import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CurrentBusinessId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermission('audit_logs.view')
  findAll(@CurrentBusinessId() businessId: string, @Query('limit') limit?: number) {
    return this.auditLogsService.findAll(businessId, limit ? Number(limit) : 100);
  }
}
