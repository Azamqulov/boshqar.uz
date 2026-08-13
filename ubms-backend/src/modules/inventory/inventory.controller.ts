import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  InventoryService,
  FindInventoryQueryDto,
  StockInDto,
  StockOutDto,
} from './inventory.service';
import { CurrentBusinessId, CurrentBranchId, CurrentUser } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermission('inventory.view')
  getInventory(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Query() query: FindInventoryQueryDto,
  ) {
    return this.inventoryService.getInventory(businessId, branchId, query);
  }

  @Post('in')
  @RequirePermission('inventory.create')
  stockIn(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: StockInDto,
  ) {
    return this.inventoryService.stockIn(businessId, branchId || body.branchId || '', userId, body);
  }

  @Post('out')
  @RequirePermission('inventory.create')
  stockOut(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: StockOutDto,
  ) {
    return this.inventoryService.stockOut(businessId, branchId || body.branchId || '', userId, body);
  }

  @Get('transactions')
  @RequirePermission('inventory.view')
  getTransactions(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Query('productId') productId?: string,
  ) {
    return this.inventoryService.getTransactions(businessId, branchId, productId);
  }
}
