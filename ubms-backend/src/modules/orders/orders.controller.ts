import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';
import { CurrentBusinessId, CurrentBranchId, CurrentUser } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermission('orders.view')
  findAll(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Query() query: any,
  ) {
    return this.ordersService.findAll(businessId, branchId, query);
  }

  @Get(':id')
  @RequirePermission('orders.view')
  findOne(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.findOne(businessId, id);
  }

  @Post()
  @RequirePermission('orders.create')
  create(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(businessId, branchId, userId, dto);
  }

  @Post(':id/complete')
  @RequirePermission('orders.create')
  complete(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() body: { payments: { paymentMethodId: string; amount: number }[] },
  ) {
    return this.ordersService.completeOrder(businessId, branchId, userId, id, body.payments);
  }

  @Post(':id/cancel')
  @RequirePermission('orders.cancel')
  cancel(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.cancel(businessId, id);
  }
}
