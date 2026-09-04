import { Injectable, ConflictException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../common/constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  // ─── Get My Departments (for Sub Admin) ─────────────────────────────────────
  async getMyDepartments(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
      include: { employee: { include: { department: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      departments: user.employee?.department ? [user.employee.department.name] : [],
      assignedTo: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email,
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
        // Use structured logger — avoids leaking stack traces to raw console
        this.logger.error('Profile image upload failed during sub-admin creation', (error as Error).stack);
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

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Auto-generate Unique Employee Code (e.g., EMP-4928)
    let isUnique = false;
    let employeeCode = '';
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
      employeeCode = `EMP-${randomNum}`;
      const codeExists = await this.prisma.employee.findFirst({
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
        passwordHash,
        status: 'ACTIVE',
        createdById,
      },
    });

    // Create Employee
    const departmentId = dto.departmentIds?.[0]; // Approximate primary department
    await this.prisma.employee.create({
      data: {
        id: user.id,
        organizationId,
        firstName: dto.name.split(' ')[0],
        lastName: dto.name.split(' ').slice(1).join(' '),
        email: dto.email,
        employeeCode,
        designation: 'Sub Admin',
        departmentId: departmentId,
        joiningDate: new Date(),
        profilePhoto: profileImageUrl,
      }
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
      name: dto.name,
      employeeCode: employeeCode,
      role: 'SUB_ADMIN',
      status: 'ACTIVE',
      departments: dto.departmentIds,
      createdAt: user.createdAt,
      profileImage: profileImageUrl,
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
          include: { 
            employee: { 
              include: { department: true } 
            } 
          } 
        },
      },
    });

    return userRoles.map((ur) => ({
      id: ur.user.id,
      email: ur.user.email,
      name: ur.user.employee ? `${ur.user.employee.firstName} ${ur.user.employee.lastName}` : "",
      employeeCode: ur.user.employee?.employeeCode,
      departments: ur.user.employee?.department ? [ur.user.employee.department.id] : [],
      status: ur.user.status,
      role: 'SUB_ADMIN',
      createdAt: ur.user.createdAt,
      profileImage: ur.user.employee?.profilePhoto,
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
      include: { employee: true }
    });
    if (!user) throw new NotFoundException('Sub admin not found');

    if (dto.email) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { email: dto.email }
      });
    }

    let updatedEmployee: any = user.employee;
    if (user.employeeId) {
      updatedEmployee = await this.prisma.employee.update({
        where: { id: user.employeeId },
        data: {
          ...(dto.name && { firstName: dto.name.split(' ')[0], lastName: dto.name.split(' ').slice(1).join(' ') }),
          ...(dto.email && { email: dto.email }),
          ...(dto.departmentIds && { departmentId: dto.departmentIds[0] })
        }
      });
    }

    return {
      id: user.id,
      email: dto.email || user.email,
      name: updatedEmployee ? `${updatedEmployee.firstName} ${updatedEmployee.lastName}` : "",
      departments: updatedEmployee ? [updatedEmployee.departmentId] : [], // Rough approximation
      status: user.status,
      employeeCode: updatedEmployee?.employeeCode,
    };
  }

  // 🛠️🛠️🛠️ Create HOD 🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️🛠️
  async createHod(dto: import('./dto/create-hod.dto').CreateHodDto, createdById: string, organizationId: string) {
    const creator = await this.prisma.user.findUnique({
      where: { id: createdById },
      include: { userRoles: { include: { role: true } }, employee: { include: { department: true } } }
    });

    const allowedDepts = creator?.employee?.department ? [creator.employee.department.name] : [];
    const isSuperAdmin = creator?.userRoles.some(ur => ur.role.name === 'SUPER_ADMIN');
    if (!isSuperAdmin && !allowedDepts.includes(dto.departmentName)) {
      throw new ForbiddenException(`You do not have permission to create an HOD for the '${dto.departmentName}' department. Please ensure this department is assigned to you.`);
    }

    const existing = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const role = await this.prisma.role.upsert({
      where: { organizationId_name: { organizationId, name: 'HOD' } },
      update: {},
      create: { organizationId, name: 'HOD', description: 'Head of Department', isSystem: true },
    });

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const employeeCode = `HOD-${randomNum}`;

    const department = await this.prisma.department.findFirst({
      where: { name: { equals: dto.departmentName, mode: 'insensitive' }, organizationId }
    });
    if (!department) throw new NotFoundException(`Department "${dto.departmentName}" not found. HOD not created.`);

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email,
        passwordHash,
        status: 'ACTIVE',
        createdById,
        userRoles: { create: { roleId: role.id, assignedById: createdById } },
      },
    });

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

    await this.prisma.department.update({
      where: { id: department.id },
      data: { hodId: user.id }
    });

    return { id: user.id, email: user.email, name: dto.name, departmentName: dto.departmentName };
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
        ...(dto.email && { email: dto.email }),
        ...(dto.status && { status: dto.status as any }),
      }
    });

    if (dto.name || dto.email || dto.profilePic !== undefined) {
      const emp = await this.prisma.employee.findFirst({ where: { id } });
      if (emp) {
        await this.prisma.employee.update({
          where: { id },
          data: {
            ...(dto.name && { 
              firstName: dto.name.split(' ')[0],
              lastName: dto.name.split(' ').slice(1).join(' ') || ''
            }),
            ...(dto.email && { email: dto.email }),
            ...(dto.profilePic !== undefined && { profilePhoto: dto.profilePic })
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
        user: {
          include: {
            employee: {
              include: { department: true }
            }
          }
        },
      },
    });

    return userRoles.map((ur) => ({
      id: ur.user.id,
      email: ur.user.email,
      name: ur.user.employee ? `${ur.user.employee.firstName} ${ur.user.employee.lastName}` : "",
      employeeCode: ur.user.employee?.employeeCode,
      departmentName: ur.user.employee?.department?.name,
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
    const hod = await this.prisma.user.findFirst({ 
      where: { id: hodId, organizationId },
      include: { employee: { include: { department: true } } }
    });
    if (!hod || !hod.employee?.department?.name) throw new NotFoundException('HOD or department not found');

    const existing = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const role = await this.prisma.role.upsert({
      where: { organizationId_name: { organizationId, name: 'EMPLOYEE' } },
      update: {},
      create: { organizationId, name: 'EMPLOYEE', description: 'Department Employee', isSystem: true },
    });

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
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

    return { id: user.id, email: user.email, name: dto.name, departmentName: dto.departmentName };
  }

  // ─── Get My Employees (for HOD) ─────────────────────────────────────────────
  async getMyEmployees(hodId: string, organizationId: string) {
    const hod = await this.prisma.user.findFirst({ 
      where: { id: hodId, organizationId },
      include: { employee: { include: { department: true } } }
    });
    if (!hod || !hod.employee?.department?.name) throw new NotFoundException('HOD or department not found');

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
        } 
      },
      include: {
        user: { include: { employee: { include: { department: true } } } },
      },
    });

    const filteredRoles = userRoles.filter(ur => ur.user.employee?.department?.name === hod.employee!.department!.name);

    return filteredRoles.map((ur) => ({
      id: ur.user.id,
      email: ur.user.email,
      name: ur.user.employee ? `${ur.user.employee.firstName} ${ur.user.employee.lastName}` : "",
      employeeCode: ur.user.employee?.employeeCode,
      departmentName: ur.user.employee?.department?.name,
      designation: ur.user.employee?.designation,
      profileImage: ur.user.employee?.profilePhoto,
      status: ur.user.status,
      role: 'EMPLOYEE',
      createdAt: ur.user.createdAt,
    }));
  }

  async resetPassword(userId: string, organizationId: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId }
    });
    return { success: true };
  }
  // ─── Self-Service Profile Update ──────────────────────────────────────────
  async updateMyProfile(userId: string, organizationId: string, dto: any, profileImageFile?: Express.Multer.File) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
      include: { employee: true }
    });
    if (!user) throw new NotFoundException('User not found');

    if (!dto.oldPassword) {
      throw new ForbiddenException('Please provide your current password to save changes.');
    }
    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) throw new ForbiddenException('Incorrect current password');

    if (dto.newPassword) {
      user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
      await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash: user.passwordHash } });
    }

    let profileImageUrl = user.employee?.profilePhoto;
    if (profileImageFile) {
      try {
        const uploadResult = await this.cloudinary.uploadImage(profileImageFile);
        profileImageUrl = uploadResult.secure_url;
      } catch (e) {}
    }

    if (user.employeeId) {
      const employeeUpdateData: any = {};
      if (dto.phone !== undefined) employeeUpdateData.phone = dto.phone;
      if (dto.address !== undefined) employeeUpdateData.currentAddress = dto.address;
      if (profileImageUrl !== user.employee?.profilePhoto) employeeUpdateData.profilePhoto = profileImageUrl;
      
      if (Object.keys(employeeUpdateData).length > 0) {
        await this.prisma.employee.update({
          where: { id: user.employeeId },
          data: employeeUpdateData
        });
      }
    }
    return { message: 'Profile updated successfully', profileImage: profileImageUrl };
  }
}
