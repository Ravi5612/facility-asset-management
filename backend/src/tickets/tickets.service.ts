import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
      include: { userRoles: { include: { role: true } }, employee: { include: { department: true } } }
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
    if (user.employee?.department?.name) {
      const dept = await this.prisma.department.findFirst({
        where: { name: { equals: user.employee?.department?.name, mode: 'insensitive' }, organizationId }
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

    // Run auto-assign logic (if enabled for the assigned department)
    await this.autoAssignTicket(ticket, organizationId);

    // Return the updated ticket
    return this.prisma.ticket.findUnique({ where: { id: ticket.id } });
  }

  // Get tickets RAISED BY me (Outbound)
  async getMyTickets(userId: string, organizationId: string) {
    // First find the user to get their email
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
    
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
        const [data, total, allTickets] = await Promise.all([
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
          this.prisma.ticket.count({ where: { organizationId } }),
          this.prisma.ticket.findMany({
            where: { organizationId },
            select: { 
                status: true, 
                assignedToDept: { select: { name: true } },
                createdAt: true, 
                assignedAt: true, 
                resolvedAt: true, 
                updatedAt: true 
            }
          })
        ]);

        // Strict Backend Calculation (FRONTEND_GUIDELINES #39)
        const departmentStats: Record<string, any> = {};
        allTickets.forEach((t: any) => {
            const deptName = t.assignedToDept?.name;
            if (!deptName) return;
            
            if (!departmentStats[deptName]) {
                departmentStats[deptName] = { total: 0, pending: 0, inProgress: 0, completed: 0, score: 0 };
            }
            const stats = departmentStats[deptName];
            stats.total++;
            
            if (t.status === "OPEN") stats.pending++;
            else if (t.status === "IN_PROGRESS") stats.inProgress++;
            else if (t.status === "RESOLVED" || t.status === "CLOSED") stats.completed++;

            let ticketScore = 0;
            // Assign Bonus
            if (t.assignedAt && t.createdAt) {
                const diffMins = (t.assignedAt.getTime() - t.createdAt.getTime()) / (1000 * 60);
                if (diffMins <= 10) ticketScore += 10;
            }
            // Speed Bonus
            if (t.status === "RESOLVED" || t.status === "CLOSED") {
                ticketScore += 10;
                if ((t.resolvedAt || t.updatedAt) && t.createdAt) {
                    const resolved = t.resolvedAt || t.updatedAt;
                    const diffHours = (resolved.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
                    if (diffHours <= 1) ticketScore += 30;
                    else if (diffHours <= 3) ticketScore += 15;
                    else if (diffHours <= 6) ticketScore += 7;
                }
            }
            stats.score += ticketScore;
        });

        return { data, total, page, limit, totalPages: Math.ceil(total / limit), departmentStats };
      }

    if (role === 'SUB_ADMIN') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { employee: { include: { department: true } } }
      });

      if (!user || !user.employee?.department?.name) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }

      const depts = await this.prisma.department.findMany({
        where: {
          organizationId,
          name: { in: (user.employee?.department?.name ? [user.employee.department.name] : []) }
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
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
    if (!user || !user.employee?.department?.name) return [];

    const dept = await this.prisma.department.findFirst({
      where: { name: { equals: user.employee?.department?.name, mode: 'insensitive' }, organizationId }
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
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
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

    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
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
        if (ticket.assignedToEmployeeId !== employee.id) {
          throw new ForbiddenException('Only the assigned employee can change the ticket status.');
        }
        updateData.status = dto.status;
        if (dto.status === 'COMPLETED' || dto.status === 'RESOLVED' || dto.status === 'CLOSED') {
          updateData.resolvedAt = new Date();
        }
      }

      if (dto.resolutionNotes) {
        updateData.resolutionNotes = dto.resolutionNotes;
      }
      
      // 2. Ticket Assignment Logic
    // Only HODs or Admins can assign tickets
    if (dto.assignedToEmployeeId !== undefined && dto.assignedToEmployeeId !== null) {
      if (role === 'HOD' || role === 'SUPER_ADMIN' || role === 'SUB_ADMIN') {
        updateData.assignedToEmployeeId = dto.assignedToEmployeeId;
        // Avoid overwriting assignedAt if it's already assigned
        if (!ticket.assignedToEmployeeId) {
          updateData.assignedAt = new Date();
          // Automatically change status from OPEN to IN_PROGRESS when assigned for the first time
          if (ticket.status === 'OPEN' && !dto.status) {
            updateData.status = 'IN_PROGRESS';
          }
        }
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

  // ─── TICKET SETTINGS ────────────────────────────────────────────────────────

  async getTicketSettings(userId: string, organizationId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
    if (!user || !user.employee?.department?.name) throw new NotFoundException('Department not found');

    const dept = await this.prisma.department.findFirst({
      where: { name: { equals: user.employee?.department?.name, mode: 'insensitive' }, organizationId }
    });
    if (!dept) throw new NotFoundException('Department not found');

    // Get or create settings for this department
    const settings = await (this.prisma as any).departmentTicketSettings.upsert({
      where: { departmentId: dept.id },
      create: {
        organizationId,
        departmentId: dept.id,
        autoAssignEnabled: true,
        rotationStaffIds: [],
        lastAssignedIndex: 0
      },
      update: {}
    });

    // Also return list of dept employees (for staff selection UI)
    const employees = await this.prisma.employee.findMany({
      where: { departmentId: dept.id, organizationId, status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true, email: true, designation: true }
    });

    return { settings, employees };
  }

  async updateTicketSettings(userId: string, organizationId: string, dto: { autoAssignEnabled?: boolean; rotationStaffIds?: string[] }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
    if (!user || !user.employee?.department?.name) throw new NotFoundException('Department not found');

    const dept = await this.prisma.department.findFirst({
      where: { name: { equals: user.employee?.department?.name, mode: 'insensitive' }, organizationId }
    });
    if (!dept) throw new NotFoundException('Department not found');

    const updated = await (this.prisma as any).departmentTicketSettings.upsert({
      where: { departmentId: dept.id },
      create: {
        organizationId,
        departmentId: dept.id,
        autoAssignEnabled: dto.autoAssignEnabled ?? true,
        rotationStaffIds: dto.rotationStaffIds ?? [],
        lastAssignedIndex: 0
      },
      update: {
        ...(dto.autoAssignEnabled !== undefined ? { autoAssignEnabled: dto.autoAssignEnabled } : {}),
        ...(dto.rotationStaffIds !== undefined ? { rotationStaffIds: dto.rotationStaffIds, lastAssignedIndex: 0 } : {})
      }
    });

    return updated;
  }

  // ─── HOD APPROVAL ───────────────────────────────────────────────────────────

  async requestHODApproval(ticketId: string, userId: string, organizationId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { organizationId, OR: [{ id: ticketId }, { ticketCode: ticketId }] }
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
    const employee = user ? await this.prisma.employee.findFirst({ where: { email: user.email, organizationId } }) : null;

    // Only the assigned employee can request HOD approval
    if (!employee || ticket.assignedToEmployeeId !== employee.id) {
      throw new ForbiddenException('Only the assigned staff can request HOD approval.');
    }

    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { hodApprovalStatus: 'PENDING' } as any
    });
  }

  async hodDecision(ticketId: string, userId: string, organizationId: string, dto: { approved: boolean; note?: string }) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { organizationId, OR: [{ id: ticketId }, { ticketCode: ticketId }] }
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        hodApprovalStatus: dto.approved ? 'APPROVED' : 'REJECTED',
        hodApprovalNote: dto.note || null
      } as any
    });
  }

  async rateTicket(id: string, userId: string, organizationId: string, rating: number, feedback?: string) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, organizationId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    
    // Allow if the ticket was raised by the user
    // Note: To be safe, we check if the user is the creator or the raiser
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
    const employee = await this.prisma.employee.findFirst({ where: { email: user?.email, organizationId } });
    const isRaiser = ticket.createdById === userId || ticket.raisedByEmployeeId === employee?.id;

    if (!isRaiser) throw new BadRequestException('Only the person who raised the ticket can rate it');
    if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') throw new BadRequestException('Only resolved tickets can be rated');
    if (ticket.rating) throw new BadRequestException('Ticket is already rated');
    if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be between 1 and 5');

    return this.prisma.ticket.update({
      where: { id },
      data: {
        rating,
        ratingFeedback: feedback || null,
        updatedById: userId
      }
    });
  }

  // 🔄 AUTO ASSIGN (Round-Robin) 🔄

  private async autoAssignTicket(ticket: any, organizationId: string) {
    const settings = await (this.prisma as any).departmentTicketSettings.findUnique({
      where: { departmentId: ticket.assignedToDeptId }
    });

    if (!settings || !settings.autoAssignEnabled || !settings.rotationStaffIds?.length) {
      return; // No auto-assign configured
    }

    const staffIds: string[] = settings.rotationStaffIds;
    const nextIndex = settings.lastAssignedIndex % staffIds.length;
    const assigneeId = staffIds[nextIndex];

    await (this.prisma as any).departmentTicketSettings.update({
      where: { departmentId: ticket.assignedToDeptId },
      data: { lastAssignedIndex: nextIndex + 1 }
    });

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        assignedToEmployeeId: assigneeId,
        assignedAt: new Date(),
        status: 'IN_PROGRESS'
      }
    });
  }
}

