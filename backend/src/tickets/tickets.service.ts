import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, organizationId: string, dto: CreateTicketDto) {
    // 1. Get the raiser's employee record
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) throw new NotFoundException('User not found');

    // To raise a ticket, you need to belong to a department. 
    // HODs have user.departmentName. Let's find their department.
    let raisedByDeptId: string | null = null;
    
    if (user.departmentName) {
      const dept = await this.prisma.department.findFirst({
        where: { name: { equals: user.departmentName, mode: 'insensitive' }, organizationId }
      });
      if (dept) raisedByDeptId = dept.id;
    }

    if (!raisedByDeptId) {
      throw new NotFoundException('You must belong to a department to raise a ticket');
    }

    // 2. Generate a random ticket code (e.g. TKT-1234)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketCode = `TKT-${randomNum}`;

    // 3. Create the ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        organizationId,
        ticketCode,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority,
        raisedByDeptId: raisedByDeptId,
        raisedByEmployeeId: userId, // Assuming user.id == employee.id
        assignedToDeptId: dto.assignedToDeptId,
        status: 'OPEN',
        createdById: userId,
      }
    });

    return ticket;
  }

  // Get tickets RAISED BY me (Outbound)
  async getMyTickets(userId: string, organizationId: string) {
    return this.prisma.ticket.findMany({
      where: { raisedByEmployeeId: userId, organizationId },
      include: {
        assignedToDept: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
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
        raisedByEmployee: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
