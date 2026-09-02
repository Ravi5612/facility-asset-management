import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD', 'EMPLOYEE')
  create(@Req() req: Request, @Body() createTicketDto: CreateTicketDto) {
    const user = req['user'] as any;
    return this.ticketsService.create(user.userId, user.organizationId, createTicketDto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'SUB_ADMIN')
  getAllTickets(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = req['user'] as any;
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '50', 10);
    return this.ticketsService.getAllTickets(user.userId, user.organizationId, user.role, pageNumber, limitNumber);
  }

  @Get('my-department')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD', 'EMPLOYEE')
  getDepartmentTickets(@Req() req: Request) {
    const user = req['user'] as any;
    return this.ticketsService.getDepartmentTickets(user.userId, user.organizationId);
  }

  @Get('raised-by-me')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD', 'EMPLOYEE')
  getMyTickets(@Req() req: Request) {
    const user = req['user'] as any;
    return this.ticketsService.getMyTickets(user.userId, user.organizationId);
  }
  
  @Get('assigned-to-me')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD', 'EMPLOYEE')
  getAssignedToMeTickets(@Req() req: Request) {
    const user = req['user'] as any;
    return this.ticketsService.getAssignedToMeTickets(user.userId, user.organizationId);
  }

  // ─── Ticket Settings ─────────────────────────────────────────────────────────

  @Get('settings')
  @Roles('HOD', 'SUPER_ADMIN', 'SUB_ADMIN')
  getTicketSettings(@Req() req: Request) {
    const user = req['user'] as any;
    return this.ticketsService.getTicketSettings(user.userId, user.organizationId);
  }

  @Patch('settings')
  @Roles('HOD', 'SUPER_ADMIN', 'SUB_ADMIN')
  updateTicketSettings(@Req() req: Request, @Body() dto: { autoAssignEnabled?: boolean; rotationStaffIds?: string[] }) {
    const user = req['user'] as any;
    return this.ticketsService.updateTicketSettings(user.userId, user.organizationId, dto);
  }

  // ─── HOD Approval ────────────────────────────────────────────────────────────

  @Post(':id/request-approval')
  @Roles('HOD', 'EMPLOYEE', 'SUB_ADMIN', 'SUPER_ADMIN')
  requestHODApproval(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as any;
    return this.ticketsService.requestHODApproval(id, user.userId, user.organizationId);
  }

  @Patch(':id/hod-decision')
  @Roles('HOD', 'SUPER_ADMIN', 'SUB_ADMIN')
  hodDecision(@Param('id') id: string, @Req() req: Request, @Body() dto: { approved: boolean; note?: string }) {
    const user = req['user'] as any;
    return this.ticketsService.hodDecision(id, user.userId, user.organizationId, dto);
  }

  @Patch(':id/rate')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD', 'EMPLOYEE')
  rateTicket(@Param('id') id: string, @Req() req: Request, @Body() dto: { rating: number; feedback?: string }) {
    const user = req['user'] as any;
    return this.ticketsService.rateTicket(id, user.userId, user.organizationId, dto.rating, dto.feedback);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD', 'EMPLOYEE')
  updateTicket(@Param('id') id: string, @Req() req: Request, @Body() updateTicketDto: any) {
    const user = req['user'] as any;
    return this.ticketsService.updateTicket(id, user.userId, user.organizationId, user.role, updateTicketDto);
  }
}