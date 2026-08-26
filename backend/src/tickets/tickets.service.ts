import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, organizationId: string, dto: CreateTicketDto) {
    // Check if assignedToDeptId actually belongs to this organization (Cross-tenant IDOR fix)
    const assignedDept = await this.prisma.department.findUnique({
      where: { id: dto.assignedToDeptId }
    });
    if (!assignedDept || assignedDept.organizationId !== organizationId) {
      throw new NotFoundException('Invalid assigned department');
    }

    // 1. Get the raiser's employee record
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } }
    });

    if (!user) throw new NotFoundException('User not found');

    // Find the corresponding employee record
    const employee = await this.prisma.employee.findFirst({
      where: {
        organizationId,
        OR: [
          { id: userId },
          { email: user.email }
        ]
      }
    });

    if (!employee) {
      throw new NotFoundException('You do not have an associated employee record to raise a ticket');
    }

    let raisedByDeptId: string | null = null;
    
    // Find department by user's departmentName
    if (user.departmentName) {
      const dept = await this.prisma.department.findFirst({
        where: { name: { equals: user.departmentName, mode: 'insensitive' }, organizationId }
      });
      if (dept) raisedByDeptId = dept.id;
    } else {
      // Fallback: If employee has departmentId, use it
      if (employee.departmentId) {
        raisedByDeptId = employee.departmentId;
      }
    }

    // If still no department and user is SUPER_ADMIN, assign to first available dept (Logic Bug fix)
    const isSuperAdmin = user.userRoles.some(ur => ur.role.name === 'SUPER_ADMIN');
    if (!raisedByDeptId && isSuperAdmin) {
      const anyDept = await this.prisma.department.findFirst({ where: { organizationId } });
      if (anyDept) raisedByDeptId = anyDept.id;
    }

    if (!raisedByDeptId) {
      throw new NotFoundException('You must belong to a department to raise a ticket');
    }

    // 2. Generate a random ticket code (collision fix)
    // Using timestamp + random to prevent collision
    const timestamp = Date.now().toString().slice(-4);
    const randomNum = Math.floor(100 + Math.random() * 900);
    const ticketCode = `TKT-${timestamp}${randomNum}`;

    // 3. Create the ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        organizationId,
        ticketCode,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority,
        raisedByDeptId: raisedByDeptId,
        raisedByEmployeeId: employee.id, // uses employee.id correctly
        assignedToDeptId: dto.assignedToDeptId,
        status: 'OPEN',
        createdById: userId }
    });

    return ticket;
  }

  // Get tickets RAISED BY me (Outbound)
  async getMyTickets(userId: string, organizationId: string) {
    // First find the user to get their email
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    // Then find the employee record for this user
    let employee: any = null;
    if (user && user.email) {
      employee = await this.prisma.employee.findFirst({
        where: { email: user.email, organizationId }
      });
    }
    
    // Fallback to userId if employee not found (for legacy records)
    const raisedById = employee ? employee.id : userId;

    return this.prisma.ticket.findMany({
      where: { raisedByEmployeeId: raisedById, organizationId },
      include: {
        assignedToDept: { select: { name: true } },
        raisedByDept: { select: { name: true } },
        raisedByEmployee: { select: { firstName: true, lastName: true, email: true } },
        assignedToEmployee: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get tickets ASSIGNED TO my department (Inbound)
  async getAllTickets(userId: string, organizationId: string, role: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    if (role === 'SUPER_ADMIN') {
      const [data, total] = await Promise.all([
        this.prisma.ticket.findMany({
          where: { organizationId },
          include: {
            raisedByDept: { select: { name: true } },
            assignedToDept: { select: { name: true } },
            raisedByEmployee: { select: { firstName: true, lastName: true, email: true } },
            assignedToEmployee: { select: { firstName: true, lastName: true, email: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.ticket.count({ where: { organizationId } })
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    if (role === 'SUB_ADMIN') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { accessibleDepartments: true }
      });

      if (!user || !user.accessibleDepartments || user.accessibleDepartments.length === 0) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }

      const depts = await this.prisma.department.findMany({
        where: {
          organizationId,
          name: { in: user.accessibleDepartments }
        },
        select: { id: true }
      });

      const deptIds = depts.map(d => d.id);
      const whereClause = {
        organizationId,
        OR: [
          { assignedToDeptId: { in: deptIds } },
          { raisedByDeptId: { in: deptIds } }
        ]
      };

      const [data, total] = await Promise.all([
        this.prisma.ticket.findMany({
          where: whereClause,
          include: {
            raisedByDept: { select: { name: true } },
            assignedToDept: { select: { name: true } },
            raisedByEmployee: { select: { firstName: true, lastName: true, email: true } },
            assignedToEmployee: { select: { firstName: true, lastName: true, email: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.ticket.count({ where: whereClause })
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    return { data: [], total: 0, page, limit, totalPages: 0 };
  }


  // Get tickets ASSIGNED TO my department (Inbound)
  async getDepartmentTickets(userId: string, organizationId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.departmentName) return [];

    const dept = await this.prisma.department.findFirst({
      where: { name: { equals: user.departmentName, mode: 'insensitive' }, organizationId }
    });

    if (!dept) return [];

    return this.prisma.ticket.findMany({
      where: { assignedToDeptId: dept.id, organizationId },
      include: {
        raisedByDept: { select: { name: true } },
        assignedToDept: { select: { name: true } },
        raisedByEmployee: { select: { firstName: true, lastName: true, email: true } },
        assignedToEmployee: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get tickets ASSIGNED TO ME (for Employee Dashboard)
  async getAssignedToMeTickets(userId: string, organizationId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) return [];

    const employee = await this.prisma.employee.findFirst({
      where: { email: user.email, organizationId }
    });

    if (!employee) return [];

    return this.prisma.ticket.findMany({
      where: { assignedToEmployeeId: employee.id, organizationId },
      include: {
        raisedByDept: { select: { name: true } },
        assignedToDept: { select: { name: true } },
        raisedByEmployee: { select: { firstName: true, lastName: true, email: true } },
        assignedToEmployee: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Update Ticket Status or Assignment
  async updateTicket(id: string, userId: string, organizationId: string, role: string, dto: any) {
    // `id` from frontend can be ticketCode (TKT-1338) or actual UUID
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        organizationId,
        OR: [
          { id },
          { ticketCode: id }
        ]
      }
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    let employee: any = null;
    if (user && user.email) {
      employee = await this.prisma.employee.findFirst({
        where: { email: user.email, organizationId }
      });
    }
    const employeeId = employee ? employee.id : userId;

    const updateData: any = {};

    // 1. Status Update Logic
    if (dto.status) {
      // Sirf assigned employee hi status badal sakta hai
      if (ticket.assignedToEmployeeId !== employeeId) {
        throw new ForbiddenException('Only the assigned employee can change the ticket status.');
      }
      updateData.status = dto.status;
    }
    
    // 2. Ticket Assignment Logic
    // Only HODs or Admins can assign tickets
    if (dto.assignedToEmployeeId !== undefined && dto.assignedToEmployeeId !== null) {
      if (role === 'HOD' || role === 'SUPER_ADMIN' || role === 'SUB_ADMIN') {
        updateData.assignedToEmployeeId = dto.assignedToEmployeeId;
      } else {
        throw new ForbiddenException('You do not have permission to assign tickets.');
      }
    }

    if (Object.keys(updateData).length === 0) return ticket;
    
    return this.prisma.ticket.update({
      where: { id: ticket.id }, // always use the real UUID for update
      data: updateData
    });
  }
}
