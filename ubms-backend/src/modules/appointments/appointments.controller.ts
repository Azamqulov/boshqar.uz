import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { AppointmentsService, CreateAppointmentDto } from './appointments.service';
import { CurrentBusinessId, CurrentBranchId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';
import { AppointmentStatus } from '@prisma/client';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @RequirePermission('appointments.manage')
  findAll(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findAll(businessId, branchId, date);
  }

  @Post()
  @RequirePermission('appointments.manage')
  create(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(businessId, branchId, dto);
  }

  @Put(':id/status')
  @RequirePermission('appointments.manage')
  updateStatus(@Param('id') id: string, @Body('status') status: AppointmentStatus) {
    return this.appointmentsService.updateStatus(id, status);
  }

  @Get('services')
  @RequirePermission('appointments.manage')
  getServices(@CurrentBusinessId() businessId: string) {
    return this.appointmentsService.getServices(businessId);
  }

  @Post('services')
  @RequirePermission('appointments.manage')
  createService(@CurrentBusinessId() businessId: string, @Body() body: any) {
    return this.appointmentsService.createService(businessId, body);
  }
}
