import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';

@ApiTags('SuperAdmin (Tizim Boshqaruvi)')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('superadmin')
export class SuperAdminController {
  constructor(private superAdminService: SuperAdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Umumiy platforma global statistikasi' })
  getPlatformStats() {
    return this.superAdminService.getPlatformStats();
  }

  @Get('owners')
  @ApiOperation({ summary: 'Barcha firma egalari (Owners) ro\'yxati va monitoring' })
  getOwners(
    @Query('search') search?: string,
    @Query('plan') plan?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.superAdminService.getOwners(search, plan, status, page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @Get('owners/:id/stats')
  @ApiOperation({ summary: 'Firma egasi (Owner) bo\'yicha individual to\'liq statistika' })
  getOwnerStats(@Param('id') id: string) {
    return this.superAdminService.getOwnerStats(id);
  }

  @Patch('owners/:id/status')
  @ApiOperation({ summary: 'Firma egasini (Owner) va uning biznesini bloklash / faollashtirish' })
  updateOwnerStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.superAdminService.updateOwnerStatus(id, status);
  }

  @Patch('owners/:id/plan')
  @ApiOperation({ summary: "Firma egasining bizneslariga tarif rejasini biriktirish" })
  updateOwnerPlan(
    @Param('id') id: string,
    @Body('planId') planId: string,
    @Body('durationDays') durationDays?: number,
  ) {
    const days = durationDays !== undefined && durationDays !== null ? Number(durationDays) : 30;
    return this.superAdminService.updateOwnerPlan(id, planId, days);
  }

  @Get('businesses')
  @ApiOperation({ summary: 'Barcha ro\'yxatdan o\'tgan bizneslar (Tenantlar)' })
  getAllBusinesses(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.superAdminService.getAllBusinesses(search, status);
  }

  @Patch('businesses/:id/status')
  @ApiOperation({ summary: 'Biznes statusini o\'zgartirish (Bloklash / Faollashtirish)' })
  updateBusinessStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.superAdminService.updateBusinessStatus(id, status);
  }

  @Patch('businesses/:id/plan')
  @ApiOperation({ summary: 'Biznes tarif rejasini o\'zgartirish (Upgrade / Downgrade)' })
  updateBusinessPlan(
    @Param('id') id: string,
    @Body('planId') planId: string,
    @Body('durationDays') durationDays?: number,
  ) {
    const days = durationDays !== undefined && durationDays !== null ? Number(durationDays) : 30;
    return this.superAdminService.updateBusinessPlan(id, planId, days);
  }

  @Get('users')
  @ApiOperation({ summary: 'Platformadagi barcha foydalanuvchilar' })
  getAllUsers(@Query('search') search?: string) {
    return this.superAdminService.getAllUsers(search);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Foydalanuvchi akkauntini bloklash / faollashtirish' })
  updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.superAdminService.updateUserStatus(id, status);
  }

  @Patch('users/:id/toggle-superadmin')
  @ApiOperation({ summary: 'SuperAdmin huquqini berish / olish' })
  toggleSuperAdmin(@Param('id') id: string) {
    return this.superAdminService.toggleSuperAdmin(id);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Barcha tarif rejalari' })
  getPlans() {
    return this.superAdminService.getPlans();
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Tarif rejasini tahrirlash (narx, limitlar)' })
  updatePlan(
    @Param('id') id: string,
    @Body() dto: { name?: string; priceMonthly?: number; maxBranches?: number; maxUsers?: number; features?: any },
  ) {
    return this.superAdminService.updatePlan(id, dto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Global tizim audit jurnali' })
  getGlobalAuditLogs(@Query('limit') limit?: number) {
    return this.superAdminService.getGlobalAuditLogs(limit ? Number(limit) : 50);
  }

  @Delete('audit-logs/cleanup')
  @ApiOperation({ summary: 'Global tizim audit jurnallarini tozalash (1 kun, 1 hafta, 1 oy yoki barchasi)' })
  cleanupGlobalAuditLogs(@Query('period') period?: '1d' | '7d' | '30d' | 'all') {
    return this.superAdminService.cleanupGlobalAuditLogs(period || '7d');
  }

  @Get('business-types')
  @ApiOperation({ summary: 'Biznes turlari ro\'yxati va sozlamalari' })
  getBusinessTypes() {
    return this.superAdminService.getBusinessTypes();
  }

  @Patch('business-types/:type/toggle')
  @ApiOperation({ summary: 'Biznes turini yoqish / o\'chirish (Ruxsat berish / Taqiqlash)' })
  toggleBusinessType(
    @Param('type') type: string,
    @Body('isEnabled') isEnabled?: boolean,
  ) {
    return this.superAdminService.toggleBusinessType(type, isEnabled);
  }

  // 11. Demo Leads Management
  @Get('demo-leads')
  @ApiOperation({ summary: 'Barcha Demo ochgan qiziquvchi mijozlar (Leadlar) ro\'yxati' })
  getDemoLeads(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.superAdminService.getDemoLeads(
      search,
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Patch('demo-leads/:id')
  @ApiOperation({ summary: 'Demo lead holatini va izohini yangilash' })
  updateDemoLead(
    @Param('id') id: string,
    @Body() dto: { status?: string; notes?: string },
  ) {
    return this.superAdminService.updateDemoLead(id, dto);
  }

  @Delete('demo-leads/:id')
  @ApiOperation({ summary: 'Demo leadni o\'chirish' })
  deleteDemoLead(@Param('id') id: string) {
    return this.superAdminService.deleteDemoLead(id);
  }

  // 12. Real-time Live Activity
  @Get('live-activity')
  @ApiOperation({ summary: 'Jonli platforma monitoringi (so\'nggi 24 soatdagi buyurtmalar, ro\'yxatdan o\'tganlar va demo leadlar)' })
  getLivePlatformActivity() {
    return this.superAdminService.getLivePlatformActivity();
  }

  // 13. System Maintenance Mode
  @Get('maintenance')
  @ApiOperation({ summary: 'Texnik ishlar rejimi holati' })
  getMaintenance() {
    return this.superAdminService.getMaintenanceStatus();
  }

  @Patch('maintenance')
  @ApiOperation({ summary: 'Texnik ishlar rejimini yoqish / o\'chirish va xabarni tahrirlash' })
  updateMaintenance(@Body() dto: any) {
    return this.superAdminService.updateMaintenanceStatus(dto);
  }
}

