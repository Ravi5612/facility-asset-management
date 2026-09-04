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
        include: { employee: { include: { department: true } } }
      });
      if (dbUser?.employee?.department) {
        accessibleDepartments = [dbUser.employee.department.name];
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
            location: { select: { name: true } },
            
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
            assignedTo: activeAssign ? (activeAssign.employee ? `${activeAssign.employee.firstName} ${activeAssign.employee.lastName}` : (asset.location?.name ? `Seat: ${asset.location?.name}` : 'Seat')) : null,
            assignedOn: activeAssign ? activeAssign.assignedAt.toISOString().split('T')[0] : null,
            dumpedOn: null,
            repairedOn: null,
            notes: asset.notes || "",
            history: asset.assignments?.flatMap((a: any) => {
              const events: any[] = [];
              if (a.status === 'RETURNED') {
                const noteStr = a.conditionOnReturn || '';
                let title = 'Returned / Removed';
                if (noteStr.includes('IT Room')) title = 'Sent to IT Room';
                if (noteStr.includes('Store')) title = 'Sent to Store';
                
                events.push({
                  action: title,
                  person: 'Status changed',
                  date: a.returnedAt ? a.returnedAt.toISOString().split('T')[0] : a.assignedAt.toISOString().split('T')[0],
                  note: noteStr
                });
              }
              events.push({
                action: 'Assigned',
                person: a.employee ? `To Employee: ${a.employee.firstName} ${a.employee.lastName}` : (a.conditionOnAssign?.includes('Seat:') ? `To ${a.conditionOnAssign}` : (asset.location?.name ? `To Seat: ${asset.location?.name}` : 'Assigned')),
                date: a.assignedAt.toISOString().split('T')[0],
                note: a.conditionOnAssign || 'No notes provided'
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
    const dbUser = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
    if (dbUser?.employee?.department?.name?.toLowerCase() !== 'store') {
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
      where: { id: userId },
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    if (!user || !(user as any).employee?.department?.name) {
      throw new BadRequestException("No department associated with this user.");
    }

    // ── Business rule: Store/Inventory HOD can see all org assets ──────────────
    const isStoreHOD = (user as any).employee?.department?.name.toLowerCase().includes('store') || 
                       (user as any).employee?.department?.name.toLowerCase().includes('inventory');
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
          : (asset.location?.name ? `Seat: ${asset.location?.name}` : null),
        assigneeDetails: asset.currentAssignee ? {
          name: asset.currentAssignee.user?.fullName || `${asset.currentAssignee.firstName} ${asset.currentAssignee.lastName}`.trim(),
          employeeCode: asset.currentAssignee.employeeCode,
          email: asset.currentAssignee.email,
          designation: asset.currentAssignee.designation,
          department: asset.ownerDepartment?.name || null,
        } : null,
        seatDetails: asset.location?.name ? {
          seatNumber: asset.location?.name,
          floor: asset.location?.parentId,
          department: seatDeptMap.get(asset.location?.name.toLowerCase()) || asset.ownerDepartment?.name || deptName || null,
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
            const noteStr = a.conditionOnReturn || '';
            let title = 'Returned / Removed';
            if (noteStr.includes('IT Room')) title = 'Sent to IT Room';
            if (noteStr.includes('Store')) title = 'Sent to Store';
            
            events.push({
              action: title,
              person: 'Status changed',
              date: a.returnedAt ? a.returnedAt.toISOString().split('T')[0] : a.assignedAt.toISOString().split('T')[0],
              note: noteStr
            });
          }
          events.push({
            action: 'Assigned',
            person: a.employee ? `To Employee: ${a.employee.firstName} ${a.employee.lastName}` : (a.conditionOnAssign?.includes('Seat:') ? `To ${a.conditionOnAssign}` : (asset.location?.name ? `To Seat: ${asset.location?.name}` : 'Assigned')),
            date: a.assignedAt.toISOString().split('T')[0],
            note: a.conditionOnAssign || 'No notes provided'
          });
          return events;
        }) || []
      };
    };

    // ── Store HOD: return all OR own based on viewMode ──────────────────────────
    if (isStoreHOD) {
      const ownDept = await this.prisma.department.findFirst({
        where: { organizationId, name: { equals: (user as any).employee?.department?.name, mode: 'insensitive' } }
      });

      const whereClause = (viewMode === 'stock')
        ? { organizationId }
        : (ownDept ? { organizationId, ownerDepartmentId: ownDept.id } : { organizationId });

      const assets = await this.prisma.asset.findMany({
        where: whereClause,
        include: {
          category: true,
          ownerDepartment: true,
          assignments: { include: { employee: true }, orderBy: { assignedAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' },
      });

      const activeAssignIds = assets.map((a: any) => a.assignments?.find((asg: any) => asg.status === 'ACTIVE')?.assignedById).filter(Boolean);
      if (activeAssignIds.length > 0) {
        const users = await this.prisma.user.findMany({
          where: { id: { in: activeAssignIds } },
          include: { employee: true }
        });
        users.forEach(u => assignedByMap.set(u.id, { name: (u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : "") || 'Unknown', email: u.email }));
      }
      return assets.map(a => mapAsset(a));
    }

    // ── Normal HOD: return only their department's assets ───────────────────────
    const department = await this.prisma.department.findFirst({
      where: { organizationId, name: { equals: (user as any).employee?.department?.name, mode: 'insensitive' } }
    });

    if (!department) {
      throw new BadRequestException("Department not found in the system.");
    }

    const assets = await this.prisma.asset.findMany({
      where: { organizationId, ownerDepartmentId: department.id },
      include: {
        category: true,
        ownerDepartment: true,
        assignments: { include: { employee: true }, orderBy: { assignedAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' },
    });

      const activeAssignIds = assets.map((a: any) => a.assignments?.find((asg: any) => asg.status === 'ACTIVE')?.assignedById).filter(Boolean);
    if (activeAssignIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: activeAssignIds } },
        include: { employee: true }
      });
      users.forEach(u => assignedByMap.set(u.id, { name: (u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : "") || 'Unknown', email: u.email }));
    }
    return assets.map(a => mapAsset(a, department.name));
  }

  async createAsset(organizationId: string, userId: string, dto: CreateAssetDto) {
    if (dto.purchaseDate && dto.warrantyExpiry) {
      if (new Date(dto.warrantyExpiry) < new Date(dto.purchaseDate)) {
        throw new BadRequestException('Warranty expiry date cannot be earlier than purchase date.');
      }
    }

    const dbUser = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
    if (dbUser?.employee?.department?.name?.toLowerCase() !== 'store') {
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
        ownerDepartmentId: dto.departmentId || null, // null = company pool, not owned by any dept yet
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

  async unassignAsset(organizationId: string, assetId: string, userId: string, notes?: string, returnedTo?: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, organizationId },
      include: { location: true }
    });

    if (!asset) throw new BadRequestException("Asset not found");
    if (asset.status !== 'ASSIGNED') throw new BadRequestException("Asset is not assigned");

    const activeAssignment = await this.prisma.assetAssignment.findFirst({
      where: { assetId, status: 'ACTIVE' }
    });

    // Fetch the user to get their name
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId }, 
      include: { employee: true } 
    });
    const unassignedBy = user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : 'Unknown IT Person';
    
    const oldLocation = asset.location?.name || 'Unknown Seat';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
    
    const placement = returnedTo || 'IT Room';
    const detailedNote = `[Unassigned on ${timestamp} by ${unassignedBy}]\n- Removed from: ${oldLocation}\n- Placed in: ${placement}\n- Notes: ${notes || 'None'}`;

    const updates: any[] = [];
    
    if (activeAssignment) {
      updates.push(
        this.prisma.assetAssignment.update({
          where: { id: activeAssignment.id },
          data: {
            status: 'RETURNED',
            returnedAt: new Date(),
            returnedById: userId,
            conditionOnReturn: detailedNote,
          }
        })
      );
    }

    updates.push(
      this.prisma.asset.update({
        where: { id: asset.id },
        data: {
          status: placement === 'Store' ? 'IN_MAINTENANCE' : 'AVAILABLE',
          locationId: null, // Remove from seat
          ipAddress: null,
          hostname: null,
          macAddress: null,
          notes: asset.notes ? asset.notes + '\n\n' + detailedNote : detailedNote
        }
      })
    );

    await this.prisma.$transaction(updates);
    return { message: "Asset returned successfully" };
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
        const swapAction = (dto as any).swapAction;
        // STORE = theek hai, wapas store (Available)
        // STORE_DAMAGED = kharab hai, store mein bhejo (IN_MAINTENANCE - store decide karega repair ya dump)
        // IT_ROOM = IT Room mein rakhenge (IN_MAINTENANCE, still IT dept)
        const swapStatus = swapAction === 'IT_ROOM' ? 'IN_MAINTENANCE' 
                         : swapAction === 'STORE_DAMAGED' ? 'IN_MAINTENANCE' 
                         : 'AVAILABLE';
        const swapNote = swapAction === 'IT_ROOM' ? '[Swap]: Returned to IT Room (Repair)'
                       : swapAction === 'STORE_DAMAGED' ? '[Swap]: Returned to Store (Damaged - For Repair/Dump)'
                       : '[Swap]: Returned to Store (Available)';
        
        const actionUser = await this.prisma.user.findUnique({ 
          where: { id: assignedBy },
          include: { employee: true }
        });
        const actionUserName = actionUser?.employee ? `${actionUser.employee.firstName} ${actionUser.employee.lastName}` : 'HOD';

        await this.prisma.asset.update({
          where: { id: oldAsset.id },
          data: {
            status: swapStatus,
            
            ipAddress: null,
            hostname: null,
            macAddress: null,
            
            // STORE (device OK) → company pool (null) → IT ka count kam, store stock mein aaye
            // STORE_DAMAGED → ownerDept IT ka hi rahe → IT ka total count same rahe, Returned mein dikh
            // IT_ROOM → ownerDept IT ka hi rahe
            ...(swapAction === 'STORE' ? { ownerDepartmentId: null } : {}),
            notes: oldAsset.notes ? oldAsset.notes + '\n' + swapNote : swapNote
          }
        });
        await this.prisma.assetAssignment.updateMany({
          where: { assetId: oldAsset.id, status: 'ACTIVE' },
          data: {
            status: 'RETURNED',
            returnedAt: new Date(),
            conditionOnReturn: `Swapped out (by ${actionUserName})`,
            returnedById: assignedBy,
          }
        });
      }
    }

    // Get assigner's name
    const assigner = await this.prisma.user.findUnique({
      where: { id: assignedBy },
      include: { employee: true }
    });
    const assignerName = assigner?.employee ? `${assigner.employee.firstName} ${assigner.employee.lastName}` : 'IT';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

    let seatMsg = dto.seatNumber ? `Seat: ${dto.seatNumber}` : (employee ? `User: ${employee.firstName} ${employee.lastName}` : 'Unknown location');
    const detailedAssignNote = `[Assigned on ${timestamp} by ${assignerName}]\n- Assigned to: ${seatMsg}\n- Notes: ${dto.condition || 'None'}`;

    const [assignment, updatedAsset] = await this.prisma.$transaction([
      this.prisma.assetAssignment.create({
        data: {
          organizationId,
          assetId: asset.id,
          employeeId: employee?.id || null,
          assignedById: assignedBy,
          conditionOnAssign: detailedAssignNote,
          status: 'ACTIVE'
        }
      }),
      this.prisma.asset.update({
        where: { id: asset.id },
        data: { 
          status: 'ASSIGNED', 
          ipAddress: dto.ipAddress || null,
          hostname: dto.hostname || null,
          macAddress: dto.macAddress || null,
          notes: asset.notes ? asset.notes + '\n\n' + detailedAssignNote : detailedAssignNote
        }
      })
    ]);

    // Link asset to seat location so inventory page can find it by desk
    if (dto.seatNumber) {
      const seatLoc = await this.prisma.location.findFirst({
        where: { name: { equals: dto.seatNumber, mode: 'insensitive' }, type: 'DESK', organizationId }
      });
      if (seatLoc) {
        await this.prisma.asset.update({
          where: { id: asset.id },
          data: { locationId: seatLoc.id }
        });
      }
    }

    return { message: "Asset assigned successfully", assignment, asset: updatedAsset };
  }

  // Get assets assigned to the logged-in employee
  async getAssignedToMeAssets(userId: string, organizationId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });
    if (!user || !user.email) return [];

    const employee = await this.prisma.employee.findFirst({
      where: { email: user.email, organizationId }
    });

    if (!employee) return [];

    return this.prisma.asset.findMany({
      where: { 
        assignments: { some: { employeeId: employee.id, status: "ACTIVE" } },
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

  async getInventoryLog(organizationId: string, from?: string, to?: string) {
    const where: any = { organizationId, deletedAt: null };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        category: true,
        ownerDepartment: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return assets.map((a: any) => ({
      id: a.assetCode || a.id,
      name: a.name,
      category: a.category?.name || '-',
      serialNumber: a.serialNumber || '-',
      addedToStoreDate: a.createdAt,       // Jab store mein aaya
      purchaseDate: a.purchaseDate,
      assignedToDept: a.ownerDepartment?.name || 'Store (In Stock)',
      assignedDate: a.updatedAt,           // Jab department ko assign hua
      status: a.status,
    }));
  }
}
