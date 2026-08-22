import { Module } from '@nestjs/common';
import { EmployeeDashboardController } from './employee-dashboard.controller';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeDashboardController],
  providers: [EmployeeDashboardService]
})
export class EmployeeDashboardModule {}
