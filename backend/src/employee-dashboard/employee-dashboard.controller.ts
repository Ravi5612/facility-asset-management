import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('employee-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeDashboardController {
  constructor(private readonly dashboardService: EmployeeDashboardService) {}

  @Get('stats')
  @Roles('EMPLOYEE')
  getStats(@Req() req: Request) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.dashboardService.getDashboardData(user.userId, user.organizationId);
  }
}
