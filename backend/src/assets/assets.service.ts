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
          select: {
            id: true,
            assetCode: true,
            serialNumber: true,
            purchaseDate: true,
            warrantyExpiryDate: true,
            status: true,
            notes: true,
            seatNumber: true,
            assignments: {
              take: 10,
              orderBy: { assignedAt: 'desc' },
              select: {
                status: true,
                assignedAt: true,
                returnedAt: true,
                conditionOnAssign: true,
                conditionOnReturn: true,
                employee: {
                  select: { firstName: true, lastName: true }
                }
              }
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
        customFields: (cat as any).customFields || [],
        items: cat.assets.map(asset => {
          const activeAssign = asset.assignments?.find(a => a.status === 'ACTIVE');
          
          return {
            id: asset.assetCode || asset.id,
            serialNumber: asset.serialNumber,
            purchaseDate: asset.purchaseDate.toISOString().split('T')[0],
            warrantyExpiry: asset.warrantyExpiryDate ? asset.warrantyExpiryDate.toISOString().split('T')[0] : null,
            status: asset.status === 'AVAILABLE' ? 'Available' : asset.status === 'ASSIGNED' ? 'Assigned' : asset.status === 'IN_MAINTENANCE' ? 'Repair' : 'Dump',
            assignedTo: activeAssign ? (activeAssign.employee ? `${activeAssign.employee.firstName} ${activeAssign.employee.lastName}` : (asset.seatNumber ? `Seat: ${asset.seatNumber}` : 'Seat')) : null,
            assignedOn: activeAssign ? activeAssign.assignedAt.toISOString().split('T')[0] : null,
            dumpedOn: null,
            repairedOn: null,
            notes: asset.notes || "",
            history: asset.assignments?.flatMap((a: any) => {
              const events: any[] = [];
              if (a.status === 'RETURNED') {
                events.push({
                  action: 'Returned',
                  person: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : (a.conditionOnReturn?.includes('Seat:') ? `Seat: ${a.conditionOnReturn.split('Seat: ')[1]}` : 'Seat'),
                  date: a.returnedAt ? a.returnedAt.toISOString().split('T')[0] : a.assignedAt.toISOString().split('T')[0],
                  note: a.conditionOnReturn || 'No notes'
                });
              }
              events.push({
                action: 'Assigned',
                person: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : (asset.seatNumber ? `Seat: ${asset.seatNumber}` : 'Seat'),
                date: a.assignedAt.toISOString().split('T')[0],
                note: a.conditionOnAssign || 'No notes'
              });
              return events;
            }) || []
          };
        })
      };
    });

    const finalResult = (accessibleDepartments !== undefined) ? result.filter(cat => cat.items.length > 0) : result;

    let total = 0, assigned = 0, dump = 0, available = 0, repair = 0;
    finalResult.forEach(cat => {
      total += cat.items.length;
      assigned += cat.items.filter(i => i.status === 'Assigned').length;
      dump += cat.items.filter(i => i.status === 'Dump').length;
      available += cat.items.filter(i => i.status === 'Available').length;
      repair += cat.items.filter(i => i.status === 'Repair').length;
    });

    return {
      data: finalResult,
      summary: { total, assigned, dump, available, repair }
    };
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
        customFields: dto.customFields || [],
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
    let seatDeptMap = new Map<string, string>();
    let assignedByMap = new Map<string, {name: string, email: string}>();

    const mapAsset = (asset: any, deptName?: string) => {
      const activeAssign = asset.assignments?.find((a: any) => a.status === 'ACTIVE');
      const actionUser = activeAssign ? assignedByMap.get(activeAssign.assignedById) : null;

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
          : (asset.seatNumber ? `Seat: ${asset.seatNumber}` : null),
        assigneeDetails: asset.currentAssignee ? {
          name: asset.currentAssignee.user?.fullName || `${asset.currentAssignee.firstName} ${asset.currentAssignee.lastName}`.trim(),
          employeeCode: asset.currentAssignee.employeeCode,
          email: asset.currentAssignee.email,
          designation: asset.currentAssignee.designation,
          department: asset.ownerDepartment?.name || null,
        } : null,
        seatDetails: asset.seatNumber ? {
          seatNumber: asset.seatNumber,
          floor: asset.floor,
          department: seatDeptMap.get(asset.seatNumber.toLowerCase()) || asset.ownerDepartment?.name || deptName || null,
          assignedBy: actionUser?.name || 'Unknown',
          assignedByEmail: actionUser?.email || '',
          assignedAt: activeAssign?.assignedAt?.toISOString() || null,
        } : null,
        serialNumber: asset.serialNumber,
        departmentName: deptName ?? asset.ownerDepartment?.name ?? null,
        isStoreHOD,      // Let frontend know it can show the toggle — cosmetic only
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.toISOString().split('T')[0] : null,
        warrantyExpiry: asset.warrantyExpiryDate ? asset.warrantyExpiryDate.toISOString().split('T')[0] : null,
        notes: asset.notes || "",
        history: asset.assignments?.flatMap((a: any) => {
          const events: any[] = [];
          if (a.status === 'RETURNED') {
            events.push({
              action: 'Returned',
              person: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : (a.conditionOnReturn?.includes('Seat:') ? `Seat: ${a.conditionOnReturn.split('Seat: ')[1]}` : 'Seat'),
              date: a.returnedAt ? a.returnedAt.toISOString().split('T')[0] : a.assignedAt.toISOString().split('T')[0],
              note: a.conditionOnReturn || 'No notes'
            });
          }
          events.push({
            action: 'Assigned',
            person: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : (asset.seatNumber ? `Seat: ${asset.seatNumber}` : 'Seat'),
            date: a.assignedAt.toISOString().split('T')[0],
            note: a.conditionOnAssign || 'No notes'
          });
          return events;
        }) || []
      };
    };

    // ── Store HOD: return all OR own based on viewMode ──────────────────────────
    if (isStoreHOD) {
      const ownDept = await this.prisma.department.findFirst({
        where: { organizationId, name: { equals: user.departmentName, mode: 'insensitive' } }
      });

      const whereClause = (viewMode === 'stock')
        ? { organizationId }
        : (ownDept ? { organizationId, ownerDepartmentId: ownDept.id } : { organizationId });

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

      const seatNumbers = assets.map((a: any) => a.seatNumber).filter(Boolean);
      if (seatNumbers.length > 0) {
        const invs = await this.prisma.inventory.findMany({
          where: { seatNumber: { in: seatNumbers, mode: 'insensitive' } },
          select: { seatNumber: true, department: true }
        });
        invs.forEach(inv => {
          if (inv.seatNumber && inv.department) seatDeptMap.set(inv.seatNumber.toLowerCase(), inv.department);
        });
      }
      const activeAssignIds = assets.map((a: any) => a.assignments?.find((asg: any) => asg.status === 'ACTIVE')?.assignedById).filter(Boolean);
      if (activeAssignIds.length > 0) {
        const users = await this.prisma.user.findMany({
          where: { id: { in: activeAssignIds } },
          select: { id: true, fullName: true, email: true }
        });
        users.forEach(u => assignedByMap.set(u.id, { name: u.fullName || 'Unknown', email: u.email }));
      }
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

    const seatNumbers = assets.map((a: any) => a.seatNumber).filter(Boolean);
    if (seatNumbers.length > 0) {
      const invs = await this.prisma.inventory.findMany({
        where: { seatNumber: { in: seatNumbers, mode: 'insensitive' } },
        select: { seatNumber: true, department: true }
      });
      invs.forEach(inv => {
        if (inv.seatNumber && inv.department) seatDeptMap.set(inv.seatNumber.toLowerCase(), inv.department);
      });
    }
    const activeAssignIds = assets.map((a: any) => a.assignments?.find((asg: any) => asg.status === 'ACTIVE')?.assignedById).filter(Boolean);
    if (activeAssignIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: activeAssignIds } },
        select: { id: true, fullName: true, email: true }
      });
      users.forEach(u => assignedByMap.set(u.id, { name: u.fullName || 'Unknown', email: u.email }));
    }
    return assets.map(a => mapAsset(a, department.name));
  }

  async createAsset(organizationId: string, userId: string, dto: CreateAssetDto) {
    if (dto.purchaseDate && dto.warrantyExpiry) {
      if (new Date(dto.warrantyExpiry) < new Date(dto.purchaseDate)) {
        throw new BadRequestException('Warranty expiry date cannot be earlier than purchase date.');
      }
    }

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

    // Backend validation for dynamic custom fields
    if (category.customFields && Array.isArray(category.customFields)) {
      for (const field of category.customFields) {
        if ((field as any).required) {
          const val = dto.hardwareDetails?.[(field as any).name];
          if (!val || val.toString().trim() === '') {
            throw new BadRequestException(`Missing required custom field: ${(field as any).name}`);
          }
        }
      }
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
        hardwareDetails: dto.hardwareDetails || {},
        notes: dto.notes,
        createdById: userId,
        status: 'AVAILABLE'
      }
    });

    return asset;
  }

  async shiftAsset(organizationId: string, assetId: string, userId: string, dto: any) {
    return this.prisma.asset.update({
      where: { id: assetId, organizationId },
      data: { ownerDepartmentId: dto.departmentId }
    });
  }

  async updateAssetStatus(organizationId: string, assetId: string, userId: string, dto: import('./dto/asset.dto').UpdateAssetStatusDto) {
    const asset = await this.prisma.asset.findFirst({ where: { id: assetId, organizationId } });
    if (!asset) throw new BadRequestException("Asset not found");

    const newNote = dto.notes ? `[Status -> ${dto.status}]: ${dto.notes}` : `[Status -> ${dto.status}]`;

    return this.prisma.asset.update({
      where: { id: assetId, organizationId },
      data: { 
        status: dto.status, 
        notes: asset.notes ? asset.notes + '\n' + newNote : newNote 
      }
    });
  }

  async assignAsset(organizationId: string, assetId: string, employeeId: string | undefined, assignedBy: string, dto: import('./dto/asset.dto').AssignAssetDto) {
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

    if (employeeId && !employee) {
      throw new BadRequestException("Employee not found");
    }

    if (dto.replaceExisting && dto.existingSerialNumber) {
      const oldAsset = await this.prisma.asset.findFirst({
        where: { serialNumber: dto.existingSerialNumber, organizationId, status: 'ASSIGNED' }
      });
      if (oldAsset) {
        const swapStatus = (dto as any).swapAction === 'IT_ROOM' ? 'IN_MAINTENANCE' : 'AVAILABLE';
        const swapNote = swapStatus === 'IN_MAINTENANCE' ? '[Swap]: Returned to IT Room (Repair)' : '[Swap]: Returned to Store (Available)';
        
        const actionUser = await this.prisma.user.findUnique({ where: { id: assignedBy } });
        const actionUserName = actionUser?.fullName || 'HOD';

        await this.prisma.asset.update({
          where: { id: oldAsset.id },
          data: {
            status: swapStatus,
            currentAssigneeId: null,
            ipAddress: null,
            hostname: null,
            macAddress: null,
            seatNumber: null,
            floor: null,
            notes: oldAsset.notes ? oldAsset.notes + '\n' + swapNote : swapNote
          }
        });
        await this.prisma.assetAssignment.updateMany({
          where: { assetId: oldAsset.id, status: 'ACTIVE' },
          data: {
            status: 'RETURNED',
            returnedAt: new Date(),
            conditionOnReturn: oldAsset.seatNumber ? `Swapped out from Seat: ${oldAsset.seatNumber} (by ${actionUserName})` : `Swapped out (by ${actionUserName})`,
            returnedById: assignedBy,
          }
        });
      }
    }

    const [assignment, updatedAsset] = await this.prisma.$transaction([
      this.prisma.assetAssignment.create({
        data: {
          organizationId,
          assetId: asset.id,
          employeeId: employee?.id || null,
          assignedById: assignedBy,
          conditionOnAssign: dto.condition,
          status: 'ACTIVE'
        }
      }),
      this.prisma.asset.update({
        where: { id: asset.id },
        data: { 
          status: 'ASSIGNED', 
          currentAssigneeId: employee?.id || null,
          ipAddress: dto.ipAddress || null,
          hostname: dto.hostname || null,
          macAddress: dto.macAddress || null,
          seatNumber: dto.seatNumber || null,
          floor: dto.floor || null
        }
      })
    ]);

    const category = await this.prisma.assetCategory.findUnique({ where: { id: asset.categoryId } });
    const catName = category?.name?.toLowerCase() || 'cpu';
    let existingInv = await this.prisma.inventory.findFirst({
      where: { seatNumber: { equals: dto.seatNumber || "UNKNOWN_SEAT", mode: "insensitive" } }
    });
    
    if (existingInv) {
      const updateData: any = {};
      if (catName === 'cpu') {
         updateData.serialNumber = updatedAsset.serialNumber;
         if (dto.ipAddress) updateData.ipAddress = dto.ipAddress;
         if (dto.macAddress) updateData.macAddress = dto.macAddress;
         if (dto.hostname) updateData.hostname = dto.hostname;
      } else if (catName === 'keyboard') {
         updateData.keyboard = updatedAsset.serialNumber;
      } else if (catName === 'mouse') {
         updateData.mouse = updatedAsset.serialNumber;
      } else if (catName === 'monitor') {
         updateData.monitor = updatedAsset.serialNumber;
      } else if (catName === 'headset') {
         updateData.headset = updatedAsset.serialNumber;
      } else {
         updateData.cables = updatedAsset.serialNumber;
      }
      await this.prisma.inventory.update({ where: { id: existingInv.id }, data: updateData });
    }

    return { message: "Asset assigned successfully", assignment, asset: updatedAsset };
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
