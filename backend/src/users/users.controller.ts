import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/my-departments → Sub-Admin sees their own assigned departments
  @Get('my-departments')
  @Roles('SUB_ADMIN')
  getMyDepartments(@Req() req: Request) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.usersService.getMyDepartments(user.userId, user.organizationId);
  }

  // POST /users/sub-admins → Only SUPER_ADMIN can create
  @Post('sub-admins')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  createSubAdmin(@Body() dto: CreateSubAdminDto, @Req() req: Request) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.usersService.createSubAdmin(dto, user.userId, user.organizationId);
  }

  // GET /users/sub-admins  → Only SUPER_ADMIN
  @Get('sub-admins')
  @Roles('SUPER_ADMIN')
  getSubAdmins(@Req() req: Request) {
    const user = req['user'] as { organizationId: string };
    return this.usersService.getSubAdmins(user.organizationId);
  }

  // PATCH /users/sub-admins/:id/toggle → Toggle active/inactive
  @Patch('sub-admins/:id/toggle')
  @Roles('SUPER_ADMIN')
  toggleStatus(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as { organizationId: string };
    return this.usersService.toggleStatus(id, user.organizationId);
  }

  // DELETE /users/sub-admins/:id
  @Delete('sub-admins/:id')
  @Roles('SUPER_ADMIN')
  deleteSubAdmin(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as { organizationId: string };
    return this.usersService.deleteSubAdmin(id, user.organizationId);
  }

  // POST /users/hod → SUB_ADMIN creates HOD
  @Post('hod')
  @Roles('SUB_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  createHod(@Body() dto: import('./dto/create-hod.dto').CreateHodDto, @Req() req: Request) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.usersService.createHod(dto, user.userId, user.organizationId);
  }

  // GET /users/hod → SUB_ADMIN views HODs
  @Get('hod')
  @Roles('SUB_ADMIN')
  getHods(@Req() req: Request) {
    const user = req['user'] as { organizationId: string };
    return this.usersService.getHods(user.organizationId);
  }

  // POST /users/employees → HOD creates Employee
  @Post('employees')
  @Roles('HOD')
  @HttpCode(HttpStatus.CREATED)
  createEmployee(@Body() dto: import('./dto/create-employee-user.dto').CreateEmployeeUserDto, @Req() req: Request) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.usersService.createEmployee(dto, user.userId, user.organizationId);
  }

  // GET /users/employees → HOD views Employees
  @Get('employees')
  @Roles('HOD')
  getEmployees(@Req() req: Request) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.usersService.getMyEmployees(user.userId, user.organizationId);
  }
}
