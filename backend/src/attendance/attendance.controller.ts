import { Controller, Post, Body, UseGuards, Req, Get, Param, Query, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { BulkUploadAttendanceDto } from './dto/bulk-upload-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  async uploadBulkAttendance(@Body() body: BulkUploadAttendanceDto, @Req() req: any) {
    const user = req.user;
    if (user.role !== 'HOD' && user.role !== 'SUPER_ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }
    const records = body.records;

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

        // Auto-determine status if checkIn exists
        let status = record.status || (checkIn ? 'PRESENT' : 'ABSENT');
        if (status === 'LEAVE') status = 'ON_LEAVE';
        const attendanceStatus = status as 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY';

        // Upsert is complex with composite keys in this schema, so do find+update/create
        const existing = await this.prisma.attendance.findFirst({
          where: { employeeId: emp.id, date }
        });

        if (existing) {
          await this.prisma.attendance.update({
            where: { id: existing.id },
            data: { checkIn, checkOut, status: attendanceStatus }
          });
        } else {
          await this.prisma.attendance.create({
            data: {
              organizationId: user.organizationId,
              employeeId: emp.id,
              date,
              checkIn,
              checkOut,
              status: attendanceStatus
            }
          });
        }
        successCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(`Error on ${record.employeeCode}: ${err.message}`);
      }
    }

    return {
      success: true,
      message: `Uploaded ${successCount} records. Errors: ${errorCount}`,
      errors
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('department')
  async getDepartmentAttendance(@Query('dept') deptName: string, @Query('date') dateStr: string, @Req() req: any) {
    const user = req.user;
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    targetDate.setHours(0,0,0,0);

    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { accessibleDepartments: true }
    });

    if (user.role !== 'SUPER_ADMIN') {
      const allowedDepts = fullUser?.accessibleDepartments || [];
      if (!allowedDepts.includes(deptName)) {
        throw new ForbiddenException(`You do not have permission to view attendance for the '${deptName}' department.`);
      }
    }

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
