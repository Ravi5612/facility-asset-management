import { Controller, Post, Body, UseGuards, Req, Get, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  async uploadBulkAttendance(@Body('records') records: any[], @Req() req: any) {
    const user = req.user;
    if (user.role !== 'HOD' && user.role !== 'SUPER_ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    let successCount = 0;
    let errorCount = 0;
    let errors: string[] = [];

    // Process each record
    for (const record of records) {
      try {
        const emp = await this.prisma.employee.findFirst({
          where: { employeeCode: String(record.employeeCode), organizationId: user.organizationId }
        });

        if (!emp) {
          errorCount++;
          errors.push(`Employee not found: ${record.employeeCode}`);
          continue;
        }

        // Ensure employee belongs to HOD's department (if HOD)
        if (user.role === 'HOD') {
          // HOD can only upload for their department
          const dept = await this.prisma.department.findFirst({ where: { name: user.departmentName, organizationId: user.organizationId } });
          if (emp.departmentId !== dept?.id) {
            errorCount++;
            errors.push(`Employee ${record.employeeCode} not in your department`);
            continue;
          }
        }

        const date = new Date(record.date);
        date.setHours(0,0,0,0);

        let checkIn = record.checkIn ? new Date(`${record.date}T${record.checkIn}`) : null;
        let checkOut = record.checkOut ? new Date(`${record.date}T${record.checkOut}`) : null;

        // Find existing record
        const existing = await this.prisma.attendance.findFirst({
          where: { employeeId: emp.id, date }
        });

        if (existing) {
          await this.prisma.attendance.update({
            where: { id: existing.id },
            data: { checkIn, checkOut, status: record.status || 'PRESENT' }
          });
        } else {
          await this.prisma.attendance.create({
            data: {
              organizationId: user.organizationId,
              employeeId: emp.id,
              date,
              checkIn,
              checkOut,
              status: record.status || 'PRESENT'
            }
          });
        }
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(`Failed to process ${record.employeeCode}`);
      }
    }

    return { success: true, successCount, errorCount, errors };
  }

  @UseGuards(JwtAuthGuard)
  @Get('department')
  async getDepartmentAttendance(@Query('dept') deptName: string, @Query('date') dateStr: string, @Req() req: any) {
    const user = req.user;
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    targetDate.setHours(0,0,0,0);

    const dept = await this.prisma.department.findFirst({
      where: { name: deptName, organizationId: user.organizationId }
    });

    if (!dept) return { success: false, data: [] };

    const records = await this.prisma.attendance.findMany({
      where: {
        organizationId: user.organizationId,
        date: targetDate,
        employee: { departmentId: dept.id }
      },
      include: {
        employee: { select: { employeeCode: true, user: { select: { fullName: true } } } }
      }
    });

    return { success: true, data: records };
  }
}
