import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { AssetsModule } from './assets/assets.module';
import { InventoryModule } from './inventory/inventory.module';
import { TicketsModule } from './tickets/tickets.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeeDashboardModule } from './employee-dashboard/employee-dashboard.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',   // Strict: used for login, refresh, verify-password
        ttl: 60000,      // 1 minute window
        limit: 5,        // max 5 requests per minute
      },
      {
        name: 'medium',  // Relaxed: default for all other routes
        ttl: 60000,      // 1 minute window
        limit: 150,      // max 150 requests per minute (normal usage)
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    AssetsModule,
    InventoryModule,
    TicketsModule,
    CloudinaryModule,
    DashboardModule,
    EmployeeDashboardModule,
    AttendanceModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
