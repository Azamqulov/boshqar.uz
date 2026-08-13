import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CurrentBusinessId, CurrentBranchId, CurrentUser } from '../../common/decorators/context.decorator';
import { OpenShiftDto, CloseShiftDto } from './dto/shift.dto';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get('current')
  getCurrentShift(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.shiftsService.getCurrentShift(businessId, branchId, userId);
  }

  @Post('open')
  openShift(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: OpenShiftDto,
  ) {
    return this.shiftsService.openShift(businessId, branchId, userId, dto);
  }

  @Get(':id/summary')
  getShiftSummary(
    @CurrentBusinessId() businessId: string,
    @Param('id') shiftId: string,
  ) {
    return this.shiftsService.getShiftSummary(businessId, shiftId);
  }

  @Post(':id/close')
  closeShift(
    @CurrentBusinessId() businessId: string,
    @Param('id') shiftId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CloseShiftDto,
  ) {
    return this.shiftsService.closeShift(businessId, shiftId, userId, dto);
  }

  @Get(':id/report')
  getShiftReport(
    @CurrentBusinessId() businessId: string,
    @Param('id') shiftId: string,
  ) {
    return this.shiftsService.getShiftReport(businessId, shiftId);
  }

  @Get()
  findAll(
    @CurrentBusinessId() businessId: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
  ) {
    return this.shiftsService.findAll(businessId, branchId, status);
  }
}
