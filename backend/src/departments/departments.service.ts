import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto, organizationId: string, createdById: string) {
    const existing = await this.prisma.department.findFirst({
      where: {
        organizationId,
        OR: [{ code: dto.code }, { name: dto.name }],
      },
    });

    if (existing) {
      throw new ConflictException('Department with this code or name already exists in your organization');
    }

    const department = await this.prisma.department.create({
      data: {
        ...dto,
        organizationId,
        createdById,
      },
    });

    return department;
  }

  async findAll(organizationId: string) {
    const departments = await this.prisma.department.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { employees: true },
        }
      }
    });

    // Attach HOD details manually since HOD is a User, not Employee
    const hods = await this.prisma.user.findMany({
      where: {
        organizationId,
        userRoles: { some: { role: { name: 'HOD' } } }
      },
      include: { employee: { include: { department: true } } }
    });

    return departments.map(dept => {
      const hod = hods.find(h => h.employee?.department?.name?.toLowerCase() === dept.name.toLowerCase());
      return {
        ...dept,
        hodName: hod?.employee ? `${hod.employee.firstName} ${hod.employee.lastName}`.trim() : null,
        employeeCount: dept._count.employees
      };
    });
  }

  async findEmployees(id: string, organizationId: string) {
    const employees = await this.prisma.employee.findMany({
      where: {
        departmentId: id,
        organizationId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        designation: true
      }
    });
    return employees;
  }

  async findOne(id: string, organizationId: string) {
    const department = await this.prisma.department.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        employees: true,
        hod: true,
      }
    });
    return department;
  }

  async update(id: string, dto: import('./dto/update-department.dto').UpdateDepartmentDto, organizationId: string, updatedById: string) {
    // Optional: Add conflict check if code or name is updated
    return this.prisma.department.updateMany({
      where: { id, organizationId },
      data: {
        ...dto,
        updatedById,
      },
    });
  }

  async remove(id: string, organizationId: string, updatedById: string) {
    // Soft delete
    return this.prisma.department.updateMany({
      where: { id, organizationId },
      data: {
        deletedAt: new Date(),
        updatedById,
      },
    });
  }
}
