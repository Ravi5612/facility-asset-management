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

  async getHodDashboardData(user: { organizationId: string; userId: string; accessibleDepartments?: string[]; role: string }, deptName: string) {
    const { organizationId } = user;

    // Optional Check: verify permission
    if (user.role !== 'SUPER_ADMIN') {
      const allowedDepts = user.accessibleDepartments || [];
      if (!allowedDepts.includes(deptName)) {
        return { success: false, message: 'Forbidden' };
      }
    }

    const dept = await this.prisma.department.findFirst({
      where: { name: deptName, organizationId }
    });
    if (!dept) return { success: false, message: 'Department not found' };

    // 1. Employees Count
    const totalEmployees = await this.prisma.employee.count({
      where: { organizationId, departmentId: dept.id }
    });

    // 2. Attendance Count for Today
    const today = new Date();
    today.setHours(0,0,0,0);
    const presentToday = await this.prisma.attendance.count({
      where: {
        organizationId,
        date: today,
        employee: { departmentId: dept.id },
        status: 'PRESENT'
      }
    });

    // 3. Assets Count
    const totalAssets = await this.prisma.asset.count({
      where: { organizationId, ownerDepartmentId: dept.id }
    });

    // 4. Tickets (Outbound/Raised by this dept)
    const openTickets = await this.prisma.ticket.count({
      where: { organizationId, raisedByDeptId: dept.id, status: 'OPEN' }
    });
    const inProgressTickets = await this.prisma.ticket.count({
      where: { organizationId, raisedByDeptId: dept.id, status: 'IN_PROGRESS' }
    });
    const resolvedTickets = await this.prisma.ticket.count({
      where: { organizationId, raisedByDeptId: dept.id, status: 'RESOLVED' }
    });
    const closedTickets = await this.prisma.ticket.count({
      where: { organizationId, raisedByDeptId: dept.id, status: 'CLOSED' }
    });
    
    // 5. Recent Tickets
    const recentTickets = await this.prisma.ticket.findMany({
      where: { organizationId, raisedByDeptId: dept.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { raisedByEmployee: { select: { firstName: true, lastName: true } } }
    });

    // 6. Employees by Designation (GroupBy)
    const designations = await this.prisma.employee.groupBy({
      by: ['designation'],
      where: { organizationId, departmentId: dept.id },
      _count: { _all: true }
    });
    const employeeDesigData = designations.map(d => ({
      name: d.designation || 'Unknown',
      value: d._count._all
    }));

    return {
      success: true,
      stats: {
        totalEmployees,
        presentToday,
        totalAssets,
        activeTickets: openTickets + inProgressTickets,
      },
      chartData: {
        ticketStatusData: [
          { name: 'Open', count: openTickets },
          { name: 'In Progress', count: inProgressTickets },
          { name: 'Resolved', count: resolvedTickets },
          { name: 'Closed', count: closedTickets },
        ],
        employeeDesigData
      },
      recentTickets
    };
  }
}
