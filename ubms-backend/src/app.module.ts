import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { WebSocketsModule } from './modules/websockets/websockets.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { BranchesModule } from './modules/branches/branches.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { FinanceModule } from './modules/finance/finance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { TelegramModule } from './modules/telegram/telegram.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { HealthController } from './health.controller';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 30000, // 30s default
      max: 500,   // Maximum 500 cached entries in memory
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 daqiqa
        limit: 120,  // 120 ta so'rov
      },
    ]),
    PrismaModule,
    WebSocketsModule,
    TasksModule,
    AuthModule,
    BusinessesModule,
    BranchesModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    RefundsModule,
    CustomersModule,
    SuppliersModule,
    EmployeesModule,
    FinanceModule,
    DashboardModule,
    RestaurantModule,
    AppointmentsModule,
    NotificationsModule,
    AuditLogsModule,
    SuperAdminModule,
    ShiftsModule,
    TelegramModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
