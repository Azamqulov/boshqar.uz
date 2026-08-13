import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CurrentBusinessId, CurrentBranchId, CurrentUser } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermission('suppliers.view')
  findAll(@CurrentBusinessId() businessId: string) {
    return this.suppliersService.findAll(businessId);
  }

  @Get(':id')
  @RequirePermission('suppliers.view')
  findOne(@CurrentBusinessId() businessId: string, @Param('id') id: string) {
    return this.suppliersService.findOne(businessId, id);
  }

  @Post()
  @RequirePermission('suppliers.manage')
  create(@CurrentBusinessId() businessId: string, @Body() body: any) {
    return this.suppliersService.create(businessId, body);
  }

  @Put(':id')
  @RequirePermission('suppliers.manage')
  update(@CurrentBusinessId() businessId: string, @Param('id') id: string, @Body() body: any) {
    return this.suppliersService.update(businessId, id, body);
  }

  @Post(':id/pay')
  @RequirePermission('suppliers.manage')
  pay(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.suppliersService.paySupplier(businessId, branchId, userId, id, amount);
  }
}
