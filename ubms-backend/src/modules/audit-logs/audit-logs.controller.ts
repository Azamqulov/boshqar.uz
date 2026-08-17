import { Controller, Get, Delete, Query } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CurrentBusinessId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermission('audit_logs.view')
  @ApiOperation({ summary: 'Audit jurnallari ro\'yxati' })
  findAll(@CurrentBusinessId() businessId: string, @Query('limit') limit?: number) {
    return this.auditLogsService.findAll(businessId, limit ? Number(limit) : 100);
  }

  @Delete('cleanup')
  @RequirePermission('audit_logs.delete')
  @ApiOperation({ summary: 'Audit jurnallarini tozalash (1 kun, 1 hafta, 1 oy yoki barchasi)' })
  cleanup(
    @CurrentBusinessId() businessId: string,
    @Query('period') period?: '1d' | '7d' | '30d' | 'all',
  ) {
    return this.auditLogsService.cleanup(businessId, period || '7d');
  }
}
