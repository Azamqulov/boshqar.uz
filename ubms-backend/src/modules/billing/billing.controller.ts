import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService, PaymentRequisitesDto, CreateBillingRequestDto } from './billing.service';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { SkipSubscriptionCheck, Public } from '../../common/decorators/custom.decorator';

@ApiTags('Billing & Obuna (Monetizatsiya)')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  // 1. Get Payment Requisites (SuperAdmin Card info & Instructions)
  @Get('requisites')
  @Public()
  @SkipSubscriptionCheck()
  @ApiOperation({ summary: 'To\'lov rekvizitlari va karta ma\'lumotlarini olish' })
  getRequisites() {
    return this.billingService.getRequisites();
  }

  // 2. Update Payment Requisites (SuperAdmin Only)
  @Patch('requisites')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'To\'lov karta rekvizitlarini tahrirlash (SuperAdmin)' })
  updateRequisites(@Body() dto: Partial<PaymentRequisitesDto>) {
    return this.billingService.updateRequisites(dto);
  }

  // 3. Get Tenant Subscription Status & Plans
  @Get('status')
  @SkipSubscriptionCheck()
  @ApiOperation({ summary: 'Joriy biznesning obuna holati, qolgan kunlar va tariflar' })
  getTenantStatus(@Req() req: any) {
    const businessId = req.businessId || req.headers['x-business-id'] || req.user?.businessId;
    return this.billingService.getTenantBillingStatus(businessId);
  }

  // 4. Submit Payment Verification Request (Tenant)
  @Post('request')
  @SkipSubscriptionCheck()
  @ApiOperation({ summary: 'To\'lov cheki va so\'rovini yuborish (Tenant)' })
  submitRequest(@Req() req: any, @Body() dto: CreateBillingRequestDto) {
    const businessId = req.businessId || req.headers['x-business-id'] || req.user?.businessId;
    return this.billingService.submitBillingRequest(businessId, dto);
  }

  // 5. List All Billing Requests (SuperAdmin)
  @Get('admin/requests')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Barcha to\'lov so\'rovlari ro\'yxati (SuperAdmin)' })
  getAllRequests(@Query('status') status?: string) {
    return this.billingService.getAllBillingRequests(status);
  }

  // 6. Approve Billing Request (SuperAdmin -> Activates Plan & Subscription)
  @Patch('admin/requests/:id/approve')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'To\'lovni tasdiqlash va obunani faollashtirish (SuperAdmin)' })
  approveRequest(
    @Param('id') id: string,
    @Req() req: any,
    @Body('durationDays') durationDays?: number,
    @Body('expiresAt') expiresAt?: string,
  ) {
    const reviewerId = req.user?.userId || req.user?.id;
    return this.billingService.approveBillingRequest(
      id,
      reviewerId,
      durationDays ? Number(durationDays) : undefined,
      expiresAt,
    );
  }

  // 7. Reject Billing Request (SuperAdmin)
  @Patch('admin/requests/:id/reject')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'To\'lov so\'rovini rad etish (SuperAdmin)' })
  rejectRequest(
    @Param('id') id: string,
    @Req() req: any,
    @Body('reason') reason?: string,
  ) {
    const reviewerId = req.user?.userId || req.user?.id;
    return this.billingService.rejectBillingRequest(id, reviewerId, reason);
  }

  // 8. Update Billing Request Details (SuperAdmin)
  @Patch('admin/requests/:id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'To\'lov so\'rovi tafsilotlarini tahrirlash (SuperAdmin)' })
  updateRequest(
    @Param('id') id: string,
    @Body()
    dto: {
      planId?: string;
      durationMonths?: number;
      amount?: number;
      notes?: string;
      expiresAt?: string;
      status?: string;
    },
  ) {
    return this.billingService.updateBillingRequest(id, dto);
  }

  // 9. Delete Billing Request (SuperAdmin)
  @Delete('admin/requests/:id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'To\'lov so\'rovini o\'chirish (SuperAdmin)' })
  deleteRequest(@Param('id') id: string) {
    return this.billingService.deleteBillingRequest(id);
  }
}
