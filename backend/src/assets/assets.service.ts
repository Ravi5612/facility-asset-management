import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetCategoryDto, CreateAssetDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async getCategories(organizationId: string) {
    // We fetch categories and include assets + assignments
    const categories = await this.prisma.assetCategory.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        assets: {
          include: {
            assignments: {
              include: { employee: true, asset: true },
              orderBy: { assignedAt: 'desc' }
            }
          }
        }
      }
    });

    // Map to frontend expected format
    return categories.map(cat => {
      return {
        category: cat.name, // Usually frontend checks this
        name: cat.name,
        prefix: cat.name.slice(0, 3).toUpperCase(), // Naive prefix if DB doesn't have it
        items: cat.assets.map(asset => {
          // Find active assignment
          const activeAssign = asset.assignments?.find(a => a.status === 'ACTIVE');
          
          return {
            id: asset.assetCode || asset.id,
            serialNumber: asset.serialNumber,
            purchaseDate: asset.purchaseDate.toISOString().split('T')[0],
            warrantyExpiry: asset.warrantyExpiryDate ? asset.warrantyExpiryDate.toISOString().split('T')[0] : null,
            status: asset.status === 'AVAILABLE' ? 'Available' : asset.status === 'ASSIGNED' ? 'Assigned' : asset.status === 'IN_MAINTENANCE' ? 'Repair' : 'Dump',
            assignedTo: activeAssign ? `${activeAssign.employee.firstName} ${activeAssign.employee.lastName}` : null,
            assignedOn: activeAssign ? activeAssign.assignedAt.toISOString().split('T')[0] : null,
            dumpedOn: null, // Hardcoded for now
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
  }

  async getDepartmentAssets(organizationId: string, userId: string) {
    // Find the user to get their department name
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.departmentName) {
      throw new BadRequestException("No department associated with this user.");
    }

    // Find the department ID based on department name
    const department = await this.prisma.department.findFirst({
      where: {
        organizationId,
        name: { equals: user.departmentName, mode: 'insensitive' }
      }
    });

    if (!department) {
      throw new BadRequestException("Department not found in the system.");
    }

    const departmentId = department.id;

    const assets = await this.prisma.asset.findMany({
      where: {
        organizationId,
        ownerDepartmentId: departmentId,
      },
      include: {
        category: true,
        assignments: {
          include: { employee: true },
          orderBy: { assignedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return assets.map(asset => {
      const activeAssign = asset.assignments?.find(a => a.status === 'ACTIVE');
      return {
        id: asset.assetCode || asset.id,
        rawId: asset.id, // Keep the UUID for API calls
        name: asset.name,
        categoryName: asset.category.name,
        serialNumber: asset.serialNumber,
        status: asset.status === 'AVAILABLE' ? 'Available' : asset.status === 'ASSIGNED' ? 'Assigned' : asset.status === 'IN_MAINTENANCE' ? 'Repair' : 'Dump',
        assignedTo: activeAssign ? `${activeAssign.employee.firstName} ${activeAssign.employee.lastName}` : null,
      };
    });
  }

  async createCategory(organizationId: string, dto: CreateAssetCategoryDto) {
    const existing = await this.prisma.assetCategory.findUnique({
      where: { organizationId_name: { organizationId, name: dto.name } }
    });

    if (existing) {
      throw new BadRequestException('Category already exists');
    }

    const cat = await this.prisma.assetCategory.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.prefix || '' // Temporary hack if we want to store prefix
      }
    });
    
    return {
      category: cat.id,
      name: cat.name,
      prefix: cat.description || cat.name.slice(0,3).toUpperCase(),
      items: []
    };
  }

  async createAsset(organizationId: string, userId: string, dto: CreateAssetDto) {
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
        data: { status: 'ASSIGNED' }
      })
    ]);

    return { message: "Asset assigned successfully", assignment, updatedAsset };
  }
}
