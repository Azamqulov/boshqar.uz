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
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BillingModule } from './modules/billing/billing.module';
import { BackupModule } from './modules/backup/backup.module';
import { FiscalModule } from './modules/fiscal/fiscal.module';

import { createKeyv } from '@keyv/redis';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { SubscriptionGuard } from './common/guards/subscription.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { HealthController } from './health.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const isProd = process.env.NODE_ENV === 'production';
        const redisUrl =
          process.env.REDIS_URL ||
          (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : undefined);

        if (redisUrl) {
          const keyvStore = createKeyv(redisUrl, {
            namespace: 'boshqar_cache',
            throwOnConnectError: isProd,
          });

          return {
            stores: [keyvStore],
            ttl: 30000, // 30s default
          };
        }

        if (isProd) {
          throw new Error('REDIS_URL is required in production environment for distributed caching.');
        }

        // In-memory fallback for local development when Redis is not running
        return {
          ttl: 30000,
        };
      },
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
    CurrenciesModule,
    AiModule,
    AnalyticsModule,
    BillingModule,
    BackupModule,
    FiscalModule,
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
      useClass: SubscriptionGuard,
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
