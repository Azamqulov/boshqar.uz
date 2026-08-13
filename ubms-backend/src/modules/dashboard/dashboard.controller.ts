import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentBusinessId, CurrentBranchId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermission('reports.view')
  getSummary(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
  ) {
    return this.dashboardService.getSummary(businessId, branchId);
  }

  @Get('charts')
  @RequirePermission('reports.view')
  getCharts(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Query('days') days?: number,
  ) {
    return this.dashboardService.getChartData(businessId, branchId, days ? Number(days) : 30);
  }
}
