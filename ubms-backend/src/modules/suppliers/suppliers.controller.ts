import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CurrentBusinessId, CurrentBranchId, CurrentUser } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

import { CreateSupplierDto, UpdateSupplierDto, PaySupplierDto } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermission('suppliers.view')
  findAll(@CurrentBusinessId() businessId: string) {
    return this.suppliersService.findAll(businessId);
  }

  @Get(':id/payments')
  @RequirePermission('suppliers.view')
  getPayments(@CurrentBusinessId() businessId: string, @Param('id') id: string) {
    return this.suppliersService.getPayments(businessId, id);
  }

  @Get(':id/statement')
  @RequirePermission('suppliers.view')
  getStatement(@CurrentBusinessId() businessId: string, @Param('id') id: string) {
    return this.suppliersService.getStatement(businessId, id);
  }

  @Get(':id')
  @RequirePermission('suppliers.view')
  findOne(@CurrentBusinessId() businessId: string, @Param('id') id: string) {
    return this.suppliersService.findOne(businessId, id);
  }

  @Post()
  @RequirePermission('suppliers.manage')
  create(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: CreateSupplierDto,
  ) {
    return this.suppliersService.create(businessId, userId, body);
  }

  @Put(':id')
  @RequirePermission('suppliers.manage')
  update(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() body: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(businessId, userId, id, body);
  }

  @Post(':id/pay')
  @RequirePermission('suppliers.manage')
  pay(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() body: PaySupplierDto,
  ) {
    return this.suppliersService.paySupplier(businessId, branchId, userId, id, body);
  }

  @Delete(':id')
  @RequirePermission('suppliers.manage')
  remove(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.suppliersService.remove(businessId, userId, id);
  }
}
