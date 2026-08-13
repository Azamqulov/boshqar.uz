import { Controller, Get, Post, Body } from '@nestjs/common';
import { RefundsService, CreateRefundDto } from './refunds.service';
import { CurrentBusinessId, CurrentUser } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Get()
  @RequirePermission('orders.view')
  findAll(@CurrentBusinessId() businessId: string) {
    return this.refundsService.findAll(businessId);
  }

  @Post()
  @RequirePermission('refunds.create')
  create(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateRefundDto,
  ) {
    return this.refundsService.create(businessId, userId, dto);
  }
}
