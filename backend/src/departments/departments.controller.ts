import { Controller, Get, Post, Body, Req, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() createDepartmentDto: CreateDepartmentDto, @Req() req: Request) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.departmentsService.create(
      createDepartmentDto,
      user.organizationId,
      user.userId,
    );
  }

  @Get()
  // SUPER_ADMIN, SUB_ADMIN, and HOD can view departments
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD')
  findAll(@Req() req: Request) {
    const user = req['user'] as { organizationId: string };
    return this.departmentsService.findAll(user.organizationId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req['user'] as { organizationId: string };
    return this.departmentsService.findOne(id, user.organizationId);
  }

  @Get(':id/employees')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD')
  findEmployees(@Req() req: Request, @Param('id') id: string) {
    const user = req['user'] as { organizationId: string };
    return this.departmentsService.findEmployees(id, user.organizationId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.departmentsService.update(id, updateDepartmentDto, user.organizationId, user.userId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.departmentsService.remove(id, user.organizationId, user.userId);
  }
}
