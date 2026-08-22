import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { SettingsModule } from './settings/settings.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { AssetsModule } from './assets/assets.module';
import { TicketsModule } from './tickets/tickets.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeeDashboardModule } from './employee-dashboard/employee-dashboard.module';

@Module({
  imports: [
    AttendanceModule,
    SettingsModule,PrismaModule, AuthModule, UsersModule, DepartmentsModule, AssetsModule, TicketsModule, CloudinaryModule, DashboardModule, EmployeeDashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
