import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeeDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: string, organizationId: string) {
    // We get the user, and their linked employee
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const employee = await this.prisma.employee.findUnique({
      where: { id: user.id }, // We set Employee.id = User.id during creation
      include: {
        department: true,
        assetsAssigned: {
          include: { category: true }
        },
        raisedTickets: true,
        salaryHistories: {
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        attendance: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // First day of current month
            }
          }
        }
      }
    });

    if (!employee) throw new NotFoundException('Employee details not found');

    // Aggregate attendance
    let present = 0;
    let absent = 0;
    let leaves = 0;
    employee.attendance.forEach(a => {
      if (a.status === 'PRESENT') present++;
      else if (a.status === 'ABSENT') absent++;
      else if (a.status === 'ON_LEAVE') leaves++;
    });

    return {
      employeeInfo: {
        name: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        designation: employee.designation,
        department: employee.department.name,
        email: employee.email,
        phone: employee.phone,
        joiningDate: employee.joiningDate.toDateString(),
        profilePic: employee.profilePhoto,
      },
      attendanceStats: {
        present,
        absent,
        leaves,
        totalWorkingDays: 22, // Static approx for now
      },
      myAssets: employee.assetsAssigned.map(a => ({
        id: a.assetCode,
        name: a.name,
        type: a.category.name,
        assignedOn: a.purchaseDate.toDateString(), // Mocking assignment date as purchase date
        status: a.status
      })),
      myTickets: employee.raisedTickets.map(t => ({
        id: t.ticketCode,
        subject: t.subject,
        date: t.createdAt.toDateString(),
        status: t.status,
        priority: t.priority
      })),
      salaryHistory: employee.salaryHistories.map(s => ({
        month: s.month,
        amount: `₹ ${s.amount.toString()}`,
        status: s.status,
        date: s.datePaid ? s.datePaid.toDateString() : '-'
      }))
    };
  }
}
