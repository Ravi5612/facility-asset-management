import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetCategoryDto, CreateAssetDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async getCategories(organizationId: string, userId: string, role: string) {
    let accessibleDepartments: string[] | undefined = undefined;

    if (role === 'SUB_ADMIN') {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { accessibleDepartments: true }
      });
      if (dbUser?.accessibleDepartments) {
        accessibleDepartments = dbUser.accessibleDepartments;
      }
    }

    let allowedDeptIds: string[] | undefined = undefined;

    if (accessibleDepartments && accessibleDepartments.length > 0) {
      const depts = await this.prisma.department.findMany({
        where: {
          organizationId,
          name: { in: accessibleDepartments }
        },
        select: { id: true }
      });
      allowedDeptIds = depts.map(d => d.id);
    }

    const categories = await this.prisma.assetCategory.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        assets: {
          where: allowedDeptIds ? { ownerDepartmentId: { in: allowedDeptIds } } : undefined,
          include: {
            assignments: {
              include: { employee: true, asset: true },
              orderBy: { assignedAt: 'desc' }
            }
          }
        }
      }
    });

    const result = categories.map(cat => {
      return {
        category: cat.name,
        name: cat.name,
        prefix: cat.name.slice(0, 3).toUpperCase(),
        items: cat.assets.map(asset => {
          const activeAssign = asset.assignments?.find(a => a.status === 'ACTIVE');
          
          return {
            id: asset.assetCode || asset.id,
            serialNumber: asset.serialNumber,
            purchaseDate: asset.purchaseDate.toISOString().split('T')[0],
            warrantyExpiry: asset.warrantyExpiryDate ? asset.warrantyExpiryDate.toISOString().split('T')[0] : null,
            status: asset.status === 'AVAILABLE' ? 'Available' : asset.status === 'ASSIGNED' ? 'Assigned' : asset.status === 'IN_MAINTENANCE' ? 'Repair' : 'Dump',
            assignedTo: activeAssign ? `${activeAssign.employee.firstName} ${activeAssign.employee.lastName}` : null,
            assignedOn: activeAssign ? activeAssign.assignedAt.toISOString().split('T')[0] : null,
            dumpedOn: null,
            repairedOn: null,
            notes: asset.notes || "",
            history: asset.assignments?.map(a => ({
              action: a.status === 'ACTIVE' ? 'Assigned' : 'Returned',
              person: `${a.employee.firstName} ${a.employee.lastName}`,
              date: a.assignedAt.toISOString().split('T')[0],
              note: a.conditionOnAssign || 'No notes'
            })) || []
          };
        })
      };
    });

    if (accessibleDepartments !== undefined) {
      return result.filter(cat => cat.items.length > 0);
    }

    return result;
  }

  
  async createCategory(organizationId: string, userId: string, dto: CreateAssetCategoryDto) {
    const dbUser = await this.prisma.user.findUnique({ where: { id: userId }, select: { departmentName: true } });
    if (dbUser?.departmentName?.toLowerCase() !== 'store') {
      throw new ForbiddenException('Only Store HOD can add asset categories.');
    }

    const existing = await this.prisma.assetCategory.findFirst({
      where: { organizationId, name: { equals: dto.name, mode: 'insensitive' } }
    });

    if (existing) {
      throw new BadRequestException('Category already exists.');
    }

    return this.prisma.assetCategory.create({
      data: {
        organizationId,
        name: dto.name,
        description: (dto as any).description || null,
      }
    });
  }

  async getDepartmentAssets(organizationId: string, userId: string, viewMode?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.departmentName) {
      throw new BadRequestException("No department associated with this user.");
    }

    // ── Business rule: Store/Inventory HOD can see all org assets ──────────────
    const isStoreHOD = user.departmentName.toLowerCase().includes('store') || 
                       user.departmentName.toLowerCase().includes('inventory');

    const mapAsset = (asset: any, deptName?: string) => {
      const activeAssign = asset.assignments?.find((a: any) => a.status === 'ACTIVE');
      return {
        id: asset.assetCode || asset.id,
        rawId: asset.id,
        name: asset.name,
        categoryName: asset.category.name,
        status: asset.status === 'ASSIGNED' ? 'Assigned' :
                asset.status === 'IN_MAINTENANCE' ? 'Repair' :
                asset.status === 'RETIRED' ? 'Dump' : 'Available',
        assignee: asset.currentAssignee 
          ? (asset.currentAssignee.user?.fullName || `${asset.currentAssignee.firstName} ${asset.currentAssignee.lastName}`.trim()) 
          : null,
        assigneeDetails: asset.currentAssignee ? {
          name: asset.currentAssignee.user?.fullName || `${asset.currentAssignee.firstName} ${asset.currentAssignee.lastName}`.trim(),
          employeeCode: asset.currentAssignee.employeeCode,
          email: asset.currentAssignee.email,
          designation: asset.currentAssignee.designation,
          department: asset.ownerDepartment?.name || null,
        } : null,
        serialNumber: asset.serialNumber,
        departmentName: deptName ?? asset.ownerDepartment?.name ?? null,
        isStoreHOD,      // Let frontend know it can show the toggle — cosmetic only
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.toISOString().split('T')[0] : null,
        warrantyExpiry: asset.warrantyExpiryDate ? asset.warrantyExpiryDate.toISOString().split('T')[0] : null,
        notes: asset.notes || "",
        history: asset.assignments?.map((a: any) => ({
          action: a.status === 'ACTIVE' ? 'Assigned' : 'Returned',
          person: `${a.employee.firstName} ${a.employee.lastName}`,
          date: a.assignedAt.toISOString().split('T')[0],
          note: a.conditionOnAssign || 'No notes'
        })) || []
      };
    };

    // ── Store HOD: return all OR own based on viewMode ──────────────────────────
    if (isStoreHOD) {
      const ownDept = await this.prisma.department.findFirst({
        where: { organizationId, name: { equals: user.departmentName, mode: 'insensitive' } }
      });

      const whereClause = (viewMode === 'own' && ownDept)
        ? { organizationId, ownerDepartmentId: ownDept.id }
        : { organizationId };

      const assets = await this.prisma.asset.findMany({
        where: whereClause,
        include: {
          category: true,
          ownerDepartment: true,
          currentAssignee: { include: { user: true } },
          assignments: { include: { employee: true }, orderBy: { assignedAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' },
      });

      return assets.map(a => mapAsset(a));
    }

    // ── Normal HOD: return only their department's assets ───────────────────────
    const department = await this.prisma.department.findFirst({
      where: { organizationId, name: { equals: user.departmentName, mode: 'insensitive' } }
    });

    if (!department) {
      throw new BadRequestException("Department not found in the system.");
    }

    const assets = await this.prisma.asset.findMany({
      where: { organizationId, ownerDepartmentId: department.id },
      include: {
        category: true,
        ownerDepartment: true,
        currentAssignee: { include: { user: true } },
        assignments: { include: { employee: true }, orderBy: { assignedAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map(a => mapAsset(a, department.name));
  }

  async createAsset(organizationId: string, userId: string, dto: CreateAssetDto) {
    const dbUser = await this.prisma.user.findUnique({ where: { id: userId }, select: { departmentName: true } });
    if (dbUser?.departmentName?.toLowerCase() !== 'store') {
      throw new ForbiddenException('Only Store HOD can add assets.');
    }

    // Generate asset code logic (e.g., Prefix-001)
    const category = await this.prisma.assetCategory.findUnique({
      where: { organizationId_name: { organizationId, name: dto.categoryId } } // Frontend sends name as categoryId
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const count = await this.prisma.asset.count({ where: { categoryId: category.id } });
    const prefix = (category.description || category.name.slice(0,3)).toUpperCase();
    const nextNum = (count + 1).toString().padStart(3, '0');
    const assetCode = `${prefix}-${nextNum}`;

    const asset = await this.prisma.asset.create({
      data: {
        organizationId,
        name: dto.assetName,
        categoryId: category.id, // Better to use category.id directly since we looked it up
        ownerDepartmentId: dto.departmentId,
        serialNumber: dto.serialNumber,
        assetCode,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
        purchasePrice: 0, // Not provided in simple form
        warrantyExpiryDate: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : null,
        notes: dto.notes,
        createdById: userId,
        status: 'AVAILABLE'
      }
    });

    return asset;
  }

  async assignAsset(organizationId: string, assetId: string, employeeId: string, assignedBy: string, dto: import('./dto/asset.dto').AssignAssetDto) {
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, organizationId }
    });

    if (!asset) {
      throw new BadRequestException("Asset not found");
    }

    if (asset.status !== 'AVAILABLE') {
      throw new BadRequestException(`Asset cannot be assigned because its status is ${asset.status}`);
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId }
    });

    if (!employee) {
      throw new BadRequestException("Employee not found");
    }

    // Wrap in transaction: create assignment + update asset status
    const [assignment, updatedAsset] = await this.prisma.$transaction([
      this.prisma.assetAssignment.create({
        data: {
          organizationId,
          assetId: asset.id,
          employeeId: employee.id,
          assignedById: assignedBy,
          conditionOnAssign: dto.condition,
          status: 'ACTIVE'
        }
      }),
      this.prisma.asset.update({
        where: { id: asset.id },
        data: { status: 'ASSIGNED', currentAssigneeId: employee.id }
      })
    ]);

    return { message: "Asset assigned successfully", assignment, updatedAsset };
  }

  // Get assets assigned to the logged-in employee
  async getAssignedToMeAssets(userId: string, organizationId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) return [];

    const employee = await this.prisma.employee.findFirst({
      where: { email: user.email, organizationId }
    });

    if (!employee) return [];

    return this.prisma.asset.findMany({
      where: { 
        currentAssigneeId: employee.id, // Using currentAssigneeId
        organizationId,
        deletedAt: null
      },
      include: {
        category: true,
        ownerDepartment: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
