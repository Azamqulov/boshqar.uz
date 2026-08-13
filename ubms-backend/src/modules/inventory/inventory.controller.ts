import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
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
    @Query() query: any,
  ) {
    return this.inventoryService.getInventory(businessId, branchId, query);
  }

  @Post('in')
  @RequirePermission('inventory.create')
  stockIn(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: any,
  ) {
    return this.inventoryService.stockIn(businessId, branchId || body.branchId, userId, body);
  }

  @Post('out')
  @RequirePermission('inventory.create')
  stockOut(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: any,
  ) {
    return this.inventoryService.stockOut(businessId, branchId || body.branchId, userId, body);
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
