import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  // ─── Get My Departments (for Sub Admin) ─────────────────────────────────────
  async getMyDepartments(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
      select: { accessibleDepartments: true, fullName: true, email: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      departments: user.accessibleDepartments,
      assignedTo: user.fullName || user.email,
    };
  }

  // ─── Create Sub Admin ───────────────────────────────────────────────────────
  async createSubAdmin(
    dto: CreateSubAdminDto, 
    createdById: string, 
    organizationId: string,
    profileImageFile?: Express.Multer.File
  ) {
    // Check if email already exists
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    // Upload image to Cloudinary if provided
    let profileImageUrl = null;
    if (profileImageFile) {
      try {
        const uploadResult = await this.cloudinary.uploadImage(profileImageFile);
        profileImageUrl = uploadResult.secure_url;
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }

    // Get or create SUB_ADMIN role
    const role = await this.prisma.role.upsert({
      where: { organizationId_name: { organizationId, name: 'SUB_ADMIN' } },
      update: {},
      create: {
        organizationId,
        name: 'SUB_ADMIN',
        description: 'Sub Administrator with limited permissions',
        isSystem: true,
      },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Auto-generate Unique Employee Code (e.g., EMP-4928)
    let isUnique = false;
    let employeeCode = '';
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
      employeeCode = `EMP-${randomNum}`;
      const codeExists = await this.prisma.user.findUnique({
        where: { employeeCode },
      });
      if (!codeExists) {
        isUnique = true;
      }
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email,
        fullName: dto.name,
        employeeCode, // Save the generated code
        accessibleDepartments: dto.departmentIds,
        passwordHash,
        status: 'ACTIVE',
        createdById,
      },
    });

    // Assign SUB_ADMIN role
    await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        assignedById: createdById,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      employeeCode: user.employeeCode,
      role: 'SUB_ADMIN',
      status: 'ACTIVE',
      departments: user.accessibleDepartments,
      createdAt: user.createdAt,
    };
  }

  // ─── Get All Sub Admins ──────────────────────────────────────────────────────
  async getSubAdmins(organizationId: string) {
    const subAdminRole = await this.prisma.role.findFirst({
      where: { organizationId, name: 'SUB_ADMIN' },
    });

    if (!subAdminRole) return [];

    const userRoles = await this.prisma.userRole.findMany({
      where: { 
        roleId: subAdminRole.id, 
        revokedAt: null,
        user: { deletedAt: null }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            employeeCode: true,
            accessibleDepartments: true,
            status: true,
            createdAt: true,
            profileImage: true,
          },
        },
      },
    });

    return userRoles.map((ur) => ({
      id: ur.user.id,
      email: ur.user.email,
      name: ur.user.fullName,
      employeeCode: ur.user.employeeCode,
      departments: ur.user.accessibleDepartments,
      status: ur.user.status,
      role: 'SUB_ADMIN',
      createdAt: ur.user.createdAt,
      profileImage: ur.user.profileImage,
    }));
  }

  // ─── Toggle Sub Admin Status ─────────────────────────────────────────────────
  async toggleStatus(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });
    if (!user) throw new NotFoundException('User not found');

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    return { id: userId, status: newStatus };
  }

  // ─── Delete Sub Admin ────────────────────────────────────────────────────────
  async deleteSubAdmin(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Soft delete
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });

    return { message: 'Sub admin deleted successfully' };
  }

  // ─── Create HOD ─────────────────────────────────────────────────────────────
  async createHod(dto: import('./dto/create-hod.dto').CreateHodDto, createdById: string, organizationId: string) {
    const existing = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const role = await this.prisma.role.upsert({
      where: { organizationId_name: { organizationId, name: 'HOD' } },
      update: {},
      create: { organizationId, name: 'HOD', description: 'Head of Department', isSystem: true },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const employeeCode = `HOD-${randomNum}`;

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email,
        fullName: dto.name,
        employeeCode,
        departmentName: dto.departmentName,
        passwordHash,
        status: 'ACTIVE',
        createdById,
        userRoles: { create: { roleId: role.id, assignedById: createdById } },
      },
    });

    // Also update the Department table to set hodId
    await this.prisma.department.updateMany({
      where: { 
        name: { equals: dto.departmentName, mode: 'insensitive' },
        organizationId 
      },
      data: { hodId: user.id }
    });

    return { id: user.id, email: user.email, name: user.fullName, departmentName: user.departmentName };
  }

  // ─── Get HODs ─────────────────────────────────────────────────────────────
  async getHods(organizationId: string) {
    const hodRole = await this.prisma.role.findUnique({
      where: { organizationId_name: { organizationId, name: 'HOD' } },
    });
    if (!hodRole) return [];

    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId: hodRole.id, revokedAt: null, user: { deletedAt: null } },
      include: {
        user: { select: { id: true, email: true, fullName: true, employeeCode: true, departmentName: true, status: true, createdAt: true } },
      },
    });

    return userRoles.map((ur) => ({
      id: ur.user.id,
      email: ur.user.email,
      name: ur.user.fullName,
      employeeCode: ur.user.employeeCode,
      departmentName: ur.user.departmentName,
      status: ur.user.status,
      role: 'HOD',
      createdAt: ur.user.createdAt,
    }));
  }

  // ─── Create Employee ────────────────────────────────────────────────────────
  async createEmployee(dto: import('./dto/create-employee-user.dto').CreateEmployeeUserDto, hodId: string, organizationId: string) {
    const hod = await this.prisma.user.findFirst({ where: { id: hodId, organizationId } });
    if (!hod || !hod.departmentName) throw new NotFoundException('HOD or department not found');

    const existing = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const role = await this.prisma.role.upsert({
      where: { organizationId_name: { organizationId, name: 'EMPLOYEE' } },
      update: {},
      create: { organizationId, name: 'EMPLOYEE', description: 'Department Employee', isSystem: true },
    });

    const passwordHash = await require('bcrypt').hash(dto.password, 10);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const employeeCode = `EMP-${randomNum}`;

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email,
        fullName: dto.name,
        employeeCode,
        departmentName: dto.departmentName,
        designation: dto.designation,
        passwordHash,
        status: 'ACTIVE',
        createdById: hodId,
        userRoles: { create: { roleId: role.id, assignedById: hodId } },
      },
    });

    const department = await this.prisma.department.findFirst({
      where: { name: { equals: dto.departmentName, mode: 'insensitive' }, organizationId }
    });
    if (department) {
      await this.prisma.employee.create({
        data: {
          id: user.id, // Keep IDs same for consistency
          organizationId,
          firstName: dto.name.split(' ')[0],
          lastName: dto.name.split(' ').slice(1).join(' ') || '',
          email: dto.email,
          designation: dto.designation || 'Employee',
          departmentId: department.id,
          joiningDate: new Date(),
          employeeCode
        }
      });
    }

    return { id: user.id, email: user.email, name: user.fullName, departmentName: user.departmentName };
  }

  // ─── Get My Employees (for HOD) ─────────────────────────────────────────────
  async getMyEmployees(hodId: string, organizationId: string) {
    const hod = await this.prisma.user.findFirst({ where: { id: hodId, organizationId } });
    if (!hod || !hod.departmentName) throw new NotFoundException('HOD or department not found');

    const employeeRole = await this.prisma.role.findUnique({
      where: { organizationId_name: { organizationId, name: 'EMPLOYEE' } },
    });
    if (!employeeRole) return [];

    const userRoles = await this.prisma.userRole.findMany({
      where: { 
        roleId: employeeRole.id, 
        revokedAt: null, 
        user: { 
          deletedAt: null, 
          OR: [
            { departmentName: { equals: hod.departmentName, mode: 'insensitive' } },
            { createdById: hod.id }
          ]
        } 
      },
      include: {
        user: { select: { id: true, email: true, fullName: true, employeeCode: true, departmentName: true, designation: true, status: true, createdAt: true } },
      },
    });

    return userRoles.map((ur) => ({
      id: ur.user.id,
      email: ur.user.email,
      name: ur.user.fullName,
      employeeCode: ur.user.employeeCode,
      departmentName: ur.user.departmentName,
      designation: ur.user.designation,
      status: ur.user.status,
      role: 'EMPLOYEE',
      createdAt: ur.user.createdAt,
    }));
  }
}
