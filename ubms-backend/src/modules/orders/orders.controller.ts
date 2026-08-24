import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { OrdersService, CreateOrderDto, FindOrdersQueryDto } from './orders.service';
import { ShiftsService } from '../shifts/shifts.service';
import { OpenShiftDto, CloseShiftDto } from '../shifts/dto/shift.dto';
import { CurrentBusinessId, CurrentBranchId, CurrentUser } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly shiftsService: ShiftsService,
  ) {}

  @Get('shifts/current')
  getCurrentShift(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.shiftsService.getCurrentShift(businessId, branchId, user?.userId || user?.id);
  }

  @Post('shifts/open')
  openShift(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser() user: any,
    @Body() dto: OpenShiftDto,
  ) {
    return this.shiftsService.openShift(businessId, branchId, user?.userId || user?.id, dto);
  }

  @Get('shifts/:id/summary')
  getShiftSummary(
    @CurrentBusinessId() businessId: string,
    @Param('id') shiftId: string,
  ) {
    return this.shiftsService.getShiftSummary(businessId, shiftId);
  }

  @Post('shifts/:id/close')
  closeShift(
    @CurrentBusinessId() businessId: string,
    @Param('id') shiftId: string,
    @CurrentUser() user: any,
    @Body() dto: CloseShiftDto,
  ) {
    return this.shiftsService.closeShift(businessId, shiftId, user?.userId || user?.id, dto);
  }

  @Get('shifts/:id/report')
  getShiftReport(
    @CurrentBusinessId() businessId: string,
    @Param('id') shiftId: string,
  ) {
    return this.shiftsService.getShiftReport(businessId, shiftId);
  }

  @Get('shifts')
  findAllShifts(
    @CurrentBusinessId() businessId: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
  ) {
    return this.shiftsService.findAll(businessId, branchId, status);
  }

  @Get()
  @RequirePermission('orders.view')
  findAll(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Query() query: FindOrdersQueryDto,
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
    @CurrentUser() user: any,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(businessId, branchId, userId, dto, user);
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
