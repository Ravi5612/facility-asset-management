import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
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
}
