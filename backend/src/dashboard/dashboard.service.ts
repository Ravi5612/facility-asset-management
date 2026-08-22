import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSuperadminDashboardData(organizationId: string) {
    // 1. Stats Grid Data
    const totalAssets = await this.prisma.asset.count({ where: { organizationId } });
    const totalUsers = await this.prisma.user.count({ where: { organizationId } });
    const totalEmployees = await this.prisma.employee.count({ where: { organizationId } });
    const totalDepartments = await this.prisma.department.count({ where: { organizationId } });
    
    // Ticket Stats
    const openTickets = await this.prisma.ticket.count({ 
      where: { organizationId, status: 'OPEN' } 
    });
    const inProgressTickets = await this.prisma.ticket.count({ 
      where: { organizationId, status: 'IN_PROGRESS' } 
    });
    const pendingTickets = 0; // We don't have PENDING in TicketStatus
    const resolvedTickets = await this.prisma.ticket.count({ 
      where: { organizationId, status: 'RESOLVED' } 
    });
    const closedTickets = await this.prisma.ticket.count({ 
      where: { organizationId, status: 'CLOSED' } 
    });
    // Let's treat high priority as "Critical"
    const criticalTickets = await this.prisma.ticket.count({ 
      where: { organizationId, priority: 'HIGH' } 
    });

    // Asset Status
    const availableAssets = await this.prisma.asset.count({ where: { organizationId, status: 'AVAILABLE' } });
    const assignedAssets = await this.prisma.asset.count({ where: { organizationId, status: 'ASSIGNED' } });
    const repairAssets = await this.prisma.asset.count({ where: { organizationId, status: 'IN_MAINTENANCE' } });
    const brokenAssets = 0; // we don't have broken
    const retiredAssets = await this.prisma.asset.count({ where: { organizationId, status: 'RETIRED' } });

    // Assets by Department
    const departments = await this.prisma.department.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });

    const assetDistribution = departments.map(d => ({
      label: d.name,
      count: d._count.assets,
      percent: totalAssets > 0 ? Math.round((d._count.assets / totalAssets) * 100) : 0,
    })).sort((a, b) => b.count - a.count).slice(0, 3); // top 3

    const departmentData = departments.map(d => ({
      name: d.name,
      value: d._count.assets,
    }));

    // Mock trend data for last 6 months (ideally this would be calculated from created dates)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const assetTrendData = months.map((m, i) => ({
      month: m,
      "Total Assets": Math.floor(totalAssets * (0.5 + (i * 0.1))),
      Available: Math.floor(availableAssets * (0.5 + (i * 0.1)))
    }));

    // Calculate Greeting
    const currentHour = parseInt(
      new Date().toLocaleTimeString("en-US", { 
        timeZone: "Asia/Kolkata", 
        hour12: false, 
        hour: "numeric" 
      })
    );
    let greeting = "Good Evening";
    if (currentHour < 12) greeting = "Good Morning";
    else if (currentHour < 17) greeting = "Good Afternoon";

    return {
      greeting,
      stats: {
        totalAssets,
        totalUsers: totalUsers + totalEmployees, // Merging for "Total Users" display
        openTickets,
        totalDepartments,
        visitors: 0 // Placeholder as no visitor model exists
      },
      assetDistribution,
      ticketOverview: [
        { label: "Open", count: openTickets, color: "text-brand-info bg-brand-info/10" },
        { label: "In Progress", count: inProgressTickets, color: "text-brand-orange bg-brand-orange/10" },
        { label: "Pending", count: pendingTickets, color: "text-brand-warning bg-brand-warning/10" },
        { label: "Resolved", count: resolvedTickets + closedTickets, color: "text-brand-success bg-brand-success/10" },
        { label: "Critical", count: criticalTickets, color: "text-brand-danger bg-brand-danger/10" },
      ],
      assetStatus: [
        { label: "Available", count: availableAssets, dot: "bg-brand-success" },
        { label: "Assigned", count: assignedAssets, dot: "bg-brand-primary" },
        { label: "Under Repair", count: repairAssets, dot: "bg-brand-warning" },
        { label: "Out of Service", count: brokenAssets + retiredAssets, dot: "bg-brand-danger" },
      ],
      chartData: {
        assetTrendData,
        ticketStatusData: [
          { status: "Open", count: openTickets },
          { status: "In Progress", count: inProgressTickets },
          { status: "Pending", count: pendingTickets },
          { status: "Resolved", count: resolvedTickets + closedTickets },
          { status: "Critical", count: criticalTickets },
        ],
        departmentData,
      }
    };
  }
}
