import { Injectable } from '@nestjs/common';
import { UserStatus, BusinessStatus } from '@prisma/client';
import {
  SuperAdminAnalyticsService,
  invalidateAnalyticsCache,
} from './services/super-admin-analytics.service';
import {
  SuperAdminTenantsService,
  invalidateTenantsCache,
} from './services/super-admin-tenants.service';

export function invalidateSuperAdminCache() {
  invalidateAnalyticsCache();
  invalidateTenantsCache();
}

@Injectable()
export class SuperAdminService {
  constructor(
    private analyticsService: SuperAdminAnalyticsService,
    private tenantsService: SuperAdminTenantsService,
  ) {}

  // --- Analytics Delegation ---
  getPlatformStats() {
    return this.analyticsService.getPlatformStats();
  }

  getGlobalAuditLogs(limit: number = 50) {
    return this.analyticsService.getGlobalAuditLogs(limit);
  }

  cleanupGlobalAuditLogs(period: '1d' | '7d' | '30d' | 'all' = '7d') {
    return this.analyticsService.cleanupGlobalAuditLogs(period);
  }

  getDemoLeads(search?: string, status?: string, page = 1, limit = 50) {
    return this.analyticsService.getDemoLeads(search, status, page, limit);
  }

  updateDemoLead(id: string, dto: { status?: string; notes?: string }) {
    return this.analyticsService.updateDemoLead(id, dto);
  }

  deleteDemoLead(id: string) {
    return this.analyticsService.deleteDemoLead(id);
  }

  getLivePlatformActivity() {
    return this.analyticsService.getLivePlatformActivity();
  }

  // --- Tenants & Plans Delegation ---
  getOwners(search?: string, planFilter?: string, statusFilter?: string | UserStatus, page = 1, limit = 20) {
    return this.tenantsService.getOwners(search, planFilter, statusFilter, page, limit);
  }

  getOwnerStats(ownerId: string) {
    return this.tenantsService.getOwnerStats(ownerId);
  }

  updateOwnerStatus(ownerId: string, status: string | UserStatus) {
    return this.tenantsService.updateOwnerStatus(ownerId, status);
  }

  updateOwnerPlan(ownerId: string, planId: string, durationDays = 30) {
    return this.tenantsService.updateOwnerPlan(ownerId, planId, durationDays);
  }

  getAllBusinesses(search?: string, status?: string | BusinessStatus) {
    return this.tenantsService.getAllBusinesses(search, status);
  }

  updateBusinessStatus(id: string, status: string | BusinessStatus) {
    return this.tenantsService.updateBusinessStatus(id, status);
  }

  updateBusinessPlan(id: string, planId: string, durationDays = 30) {
    return this.tenantsService.updateBusinessPlan(id, planId, durationDays);
  }

  getAllUsers(search?: string) {
    return this.tenantsService.getAllUsers(search);
  }

  updateUserStatus(id: string, status: string | UserStatus) {
    return this.tenantsService.updateUserStatus(id, status);
  }

  toggleSuperAdmin(id: string) {
    return this.tenantsService.toggleSuperAdmin(id);
  }

  getPlans() {
    return this.tenantsService.getPlans();
  }

  updatePlan(
    id: string,
    dto: { name?: string; priceMonthly?: number; maxBranches?: number; maxUsers?: number; features?: any },
  ) {
    return this.tenantsService.updatePlan(id, dto);
  }

  getBusinessTypes() {
    return this.tenantsService.getBusinessTypes();
  }

  toggleBusinessType(type: string, isEnabled?: boolean) {
    return this.tenantsService.toggleBusinessType(type, isEnabled);
  }
}
