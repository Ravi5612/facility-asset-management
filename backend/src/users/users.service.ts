import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
        profileImage: profileImageUrl,
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
      profileImage: user.profileImage,
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

  // ─── Update Sub Admin ────────────────────────────────────────────────────────
  async updateSubAdmin(userId: string, dto: import('./dto/update-sub-admin.dto').UpdateSubAdminDto, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId, deletedAt: null },
    });
    if (!user) throw new NotFoundException('Sub admin not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { fullName: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.departmentIds && { accessibleDepartments: dto.departmentIds }),
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.fullName,
      departments: updated.accessibleDepartments,
      status: updated.status,
      employeeCode: updated.employeeCode,
    };
  }

  // 🛠️🛠️🛠️ Create HOD 🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️
  async createHod(dto: import('./dto/create-hod.dto').CreateHodDto, createdById: string, organizationId: string) {
    const creator = await this.prisma.user.findUnique({
      where: { id: createdById },
      include: { userRoles: { include: { role: true } } }
    });

    const allowedDepts = creator?.accessibleDepartments || [];
    if (!allowedDepts.includes(dto.departmentName)) {
      throw new ForbiddenException(`You do not have permission to create an HOD for the '${dto.departmentName}' department. Please ensure this department is assigned to you.`);
    }

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

    const department = await this.prisma.department.findFirst({
      where: { name: { equals: dto.departmentName, mode: 'insensitive' }, organizationId }
    });

    if (!department) {
      // Rollback: delete the user we just created
      await this.prisma.user.delete({ where: { id: user.id } });
      throw new NotFoundException(`Department "${dto.departmentName}" not found. HOD not created.`);
    }

    // Create the Employee record for the HOD so foreign keys work (needed for tickets etc.)
    await this.prisma.employee.create({
      data: {
        id: user.id,
        organizationId,
        firstName: dto.name.split(' ')[0],
        lastName: dto.name.split(' ').slice(1).join(' ') || '',
        email: dto.email,
        designation: 'Head of Department',
        departmentId: department.id,
        joiningDate: new Date(),
        employeeCode
      }
    });

    // Set hodId in Department
    await this.prisma.department.update({
      where: { id: department.id },
      data: { hodId: user.id }
    });

    return { id: user.id, email: user.email, name: user.fullName, departmentName: user.departmentName };
  }


  // ─── Get HODs ─────────────────────────────────────────────────────────────
  async updateHod(id: string, organizationId: string, dto: { name?: string; email?: string; status?: string; profilePic?: string }) {
    const existing = await this.prisma.user.findFirst({
      where: { id, organizationId }
    });

    if (!existing) {
      throw new NotFoundException('HOD not found');
    }

    if (dto.email && dto.email !== existing.email) {
      const emailTaken = await this.prisma.user.findFirst({ where: { email: dto.email } });
      if (emailTaken) throw new ConflictException('Email is already in use');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name && { fullName: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.status && { status: dto.status as any }),
        ...(dto.profilePic !== undefined && { profileImage: dto.profilePic })
      }
    });

    // Update the Employee record too if name/email changed
    if (dto.name || dto.email) {
      const emp = await this.prisma.employee.findFirst({ where: { id } });
      if (emp) {
        await this.prisma.employee.update({
          where: { id },
          data: {
            ...(dto.name && { 
              firstName: dto.name.split(' ')[0],
              lastName: dto.name.split(' ').slice(1).join(' ') || ''
            }),
            ...(dto.email && { email: dto.email })
          }
        });
      }
    }

    return { success: true };
  }

  async getHods(organizationId: string) {
    const hodRole = await this.prisma.role.findUnique({
      where: { organizationId_name: { organizationId, name: 'HOD' } },
    });
    if (!hodRole) return [];

    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId: hodRole.id, revokedAt: null, user: { deletedAt: null } },
      include: {
        user: { select: { id: true, email: true, fullName: true, employeeCode: true, departmentName: true, status: true, createdAt: true, profileImage: true } },
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
  async createEmployee(
    dto: import('./dto/create-employee-user.dto').CreateEmployeeUserDto, 
    hodId: string, 
    organizationId: string,
    files?: {
      profilePic?: Express.Multer.File[],
      aadharPhoto?: Express.Multer.File[],
      educationPhoto?: Express.Multer.File[],
      salaryProofPhoto?: Express.Multer.File[],
    }
  ) {
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

    let profilePhoto = null;
    let aadharPhoto = null;
    let educationPhoto = null;
    let salaryProofPhoto = null;

    if (files?.profilePic?.[0]) profilePhoto = (await this.cloudinary.uploadImage(files.profilePic[0]).catch(() => null))?.secure_url;
    if (files?.aadharPhoto?.[0]) aadharPhoto = (await this.cloudinary.uploadImage(files.aadharPhoto[0]).catch(() => null))?.secure_url;
    if (files?.educationPhoto?.[0]) educationPhoto = (await this.cloudinary.uploadImage(files.educationPhoto[0]).catch(() => null))?.secure_url;
    if (files?.salaryProofPhoto?.[0]) salaryProofPhoto = (await this.cloudinary.uploadImage(files.salaryProofPhoto[0]).catch(() => null))?.secure_url;

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
        profileImage: profilePhoto,
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
          phone: dto.phone,
          designation: dto.designation || 'Employee',
          departmentId: department.id,
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
          employeeCode,
          profilePhoto,
          
          fatherName: dto.fatherName,
          motherName: dto.motherName,
          dob: dto.dob ? new Date(dto.dob) : null,
          gender: dto.gender,
          bloodGroup: dto.bloodGroup,
          emergencyContact: dto.emergencyContact,
          currentAddress: dto.currentAddress,
          permanentAddress: dto.permanentAddress,
          qualification: dto.qualification,
          lastSalary: dto.lastSalary ? parseFloat(dto.lastSalary) : null,
          offeredSalary: dto.offeredSalary ? parseFloat(dto.offeredSalary) : null,
          bankName: dto.bankName,
          accountNumber: dto.accountNumber,
          ifscCode: dto.ifscCode,
          aadharNumber: dto.aadharNumber,
          criminalCase: dto.criminalCase,
          criminalDetails: dto.criminalDetails,
          illnesses: dto.illnesses,
          medication: dto.medication,
          aadharPhoto,
          educationPhoto,
          salaryProofPhoto,
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
          departmentName: { equals: hod.departmentName, mode: 'insensitive' }
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

  async resetPassword(userId: string, organizationId: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
    
    return { success: true };
  }
}
