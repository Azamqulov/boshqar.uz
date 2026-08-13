import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CurrentBusinessId, CurrentBranchId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermission('customers.view')
  findAll(@CurrentBusinessId() businessId: string, @Query('search') search?: string) {
    return this.customersService.findAll(businessId, search);
  }

  @Get(':id')
  @RequirePermission('customers.view')
  findOne(@CurrentBusinessId() businessId: string, @Param('id') id: string) {
    return this.customersService.findOne(businessId, id);
  }

  @Post()
  @RequirePermission('customers.manage')
  create(@CurrentBusinessId() businessId: string, @Body() body: any) {
    return this.customersService.create(businessId, body);
  }

  @Put(':id')
  @RequirePermission('customers.manage')
  update(@CurrentBusinessId() businessId: string, @Param('id') id: string, @Body() body: any) {
    return this.customersService.update(businessId, id, body);
  }

  @Post(':id/pay-debt')
  @RequirePermission('customers.manage')
  payDebt(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.customersService.payDebt(businessId, branchId, id, amount);
  }
}
