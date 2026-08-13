import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CurrentBusinessId, CurrentBranchId, CurrentUser } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  @RequirePermission('finance.view')
  getSummary(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.financeService.getSummary(businessId, branchId, dateFrom, dateTo);
  }

  @Get('expenses')
  @RequirePermission('finance.view')
  getExpenses(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
  ) {
    return this.financeService.getExpenses(businessId, branchId);
  }

  @Post('expenses')
  @RequirePermission('finance.create')
  createExpense(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: any,
  ) {
    return this.financeService.createExpense(businessId, branchId || body.branchId, userId, body);
  }
}
