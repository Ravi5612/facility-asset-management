import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile, UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { imageUploadOptions } from '../common/utils/file-upload.util';

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
  @UseInterceptors(FileInterceptor('profileImage', imageUploadOptions))
  @HttpCode(HttpStatus.CREATED)
  createSubAdmin(
    @Body() dto: CreateSubAdminDto,
    @Req() req: Request,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.usersService.createSubAdmin(dto, user.userId, user.organizationId, profileImage);
  }

  
  // PUT /users/sub-admins/:id -> Update SUB_ADMIN
  @Put('sub-admins/:id')
  @Roles('SUPER_ADMIN')
  updateSubAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateSubAdminDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as { organizationId: string };
    return this.usersService.updateSubAdmin(id, dto, user.organizationId);
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
  @Patch('hod/:id')
  @Roles('SUB_ADMIN')
  updateHod(
    @Param('id') id: string, 
    @Body() dto: { name?: string; email?: string; status?: string; profilePic?: string }, 
    @Req() req: Request
  ) {
    const user = req['user'] as { organizationId: string };
    return this.usersService.updateHod(id, user.organizationId, dto);
  }

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

  @Patch(':id/reset-password')
  @Roles('SUPER_ADMIN')
  async resetPassword(
    @Param('id') id: string,
    @Body() body: import('./dto/reset-password.dto').ResetPasswordDto,
    @Req() req: Request
  ) {
    const user = req['user'] as { organizationId: string };
    return this.usersService.resetPassword(id, user.organizationId, body.newPassword);
  }
}
