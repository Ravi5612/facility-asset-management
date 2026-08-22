import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('employee-dashboard')
export class EmployeeDashboardController {
  constructor(private readonly dashboardService: EmployeeDashboardService) {}

  @Get('stats')
  @Roles('EMPLOYEE')
  getStats(@Req() req: Request) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.dashboardService.getDashboardData(user.userId, user.organizationId);
  }
}
