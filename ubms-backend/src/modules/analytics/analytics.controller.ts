import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentBusinessId, CurrentBranchId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@ApiTags('Analytics & AI Insights')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('ai-insights')
  @RequirePermission('dashboard.view')
  @ApiOperation({ summary: 'Biznes uchun aqlli AI tahlil va tavsiyalar to\'plami' })
  getAIInsights(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId?: string,
  ) {
    return this.analyticsService.getAIInsights(businessId, branchId);
  }

  @Get('abc')
  @RequirePermission('dashboard.view')
  @ApiOperation({ summary: 'Mahsulotlarning ABC rentabellik tahlili' })
  getABCAnalysis(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId?: string,
  ) {
    return this.analyticsService.getABCAnalysis(businessId, branchId);
  }

  @Get('dead-stock')
  @RequirePermission('dashboard.view')
  @ApiOperation({ summary: 'Muzlagan qoldiqlar radari (30+ kun sotilmagan)' })
  getDeadStock(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId?: string,
  ) {
    return this.analyticsService.getDeadStockRadar(businessId, branchId);
  }

  @Get('peak-hours')
  @RequirePermission('dashboard.view')
  @ApiOperation({ summary: 'Qizg\'in savdo soatlari va kunlari tahlili' })
  getPeakHours(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId?: string,
  ) {
    return this.analyticsService.getPeakHoursAnalysis(businessId, branchId);
  }

  @Get('restock-predictions')
  @RequirePermission('dashboard.view')
  @ApiOperation({ summary: 'Tovar tugash xavfi va avto-buyurtma bashorati' })
  getRestockPredictions(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId?: string,
  ) {
    return this.analyticsService.getRestockPredictions(businessId, branchId);
  }

  @Get('churn-risk')
  @RequirePermission('dashboard.view')
  @ApiOperation({ summary: 'Yo\'qolayotgan doimiy mijozlar radari' })
  getChurnRisk(@CurrentBusinessId() businessId: string) {
    return this.analyticsService.getChurnRiskCustomers(businessId);
  }
}
