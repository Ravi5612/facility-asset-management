import { Controller, Get, Post, Body, Req, UseGuards, Param, Patch, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DepartmentsService } from './departments.service';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { imageUploadOptions } from '../common/utils/file-upload.util';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto, 
    @Req() req: Request, 
    @UploadedFile() file?: Express.Multer.File
  ) {
    const user = req['user'] as { userId: string; organizationId: string };
    
    let imageUrl = createDepartmentDto.imageUrl;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploadResult.secure_url;
    }
    
    return this.departmentsService.create(
      { ...createDepartmentDto, imageUrl },
      user.organizationId,
      user.userId,
    );
  }

  @Get()
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
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async update(
    @Req() req: Request, 
    @Param('id') id: string, 
    @Body() updateDepartmentDto: UpdateDepartmentDto, 
    @UploadedFile() file?: Express.Multer.File
  ) {
    const user = req['user'] as { organizationId: string; userId: string };
    
    let imageUrl = updateDepartmentDto.imageUrl;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploadResult.secure_url;
    }
    
    return this.departmentsService.update(
      id, 
      { ...updateDepartmentDto, imageUrl }, 
      user.organizationId, 
      user.userId
    );
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req['user'] as { userId: string; organizationId: string };
    return this.departmentsService.remove(id, user.organizationId, user.userId);
  }
}
