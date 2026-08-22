import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('superadmin')
  @Roles('SUPER_ADMIN')
  getSuperadminDashboard(@Req() req: any) {
    const user = req.user as { organizationId: string };
    return this.dashboardService.getSuperadminDashboardData(user.organizationId);
  }
}
