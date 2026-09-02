import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private prisma: PrismaService) {}

  @Get('history')
  async getSeatHistory(@Query('seatNumber') seatNumber: string) {
    if (!seatNumber) return [];
    
    // Find all assignments where the return condition or assign condition mentions this seat
    const history = await this.prisma.assetAssignment.findMany({
      where: {
        OR: [
          { conditionOnReturn: { contains: seatNumber, mode: 'insensitive' } },
          { conditionOnAssign: { contains: seatNumber, mode: 'insensitive' } }
        ]
      },
      include: {
        asset: {
          include: { category: true }
        },
        employee: true,
      },
      orderBy: { assignedAt: 'desc' }
    });

    return history.map(h => ({
      id: h.id,
      assetName: (h as any).asset?.name || 'Unknown',
      assetCode: (h as any).asset?.assetCode || (h as any).asset?.id,
      category: (h as any).asset?.category?.name || 'Device',
      assignedAt: h.assignedAt,
      returnedAt: h.returnedAt,
      status: h.status,
      assignedBy: 'HOD',
      returnedBy: 'HOD',
      conditionOnReturn: h.conditionOnReturn
    }));
  }

  @Get('by-seat')
  async getBySeat(@Query('seatNumber') seatNumber: string, @Query('floor') floor: string) {
    if (!seatNumber) return {};
    const entry = await this.prisma.inventory.findFirst({
      where: { 
        seatNumber: { equals: seatNumber, mode: 'insensitive' },
        ...(floor ? { floor } : {})
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    if (!entry) return {};

    const serialNumbers: string[] = [];
    if (entry.serialNumber) serialNumbers.push(entry.serialNumber);
    if (entry.keyboard) serialNumbers.push(entry.keyboard);
    if (entry.mouse) serialNumbers.push(entry.mouse);
    if (entry.monitor) serialNumbers.push(entry.monitor);
    if (entry.headset) serialNumbers.push(entry.headset);
    if (entry.cables) serialNumbers.push(entry.cables);

    if (serialNumbers.length === 0) return entry;

    const assets = await this.prisma.asset.findMany({
      where: { serialNumber: { in: serialNumbers } },
      include: { 
        category: true,
        assignments: {
          orderBy: { assignedAt: 'desc' },
          take: 1
        }
      }
    });

    const assetMap = new Map();
    assets.forEach(a => {
      // First try to find an active assignment, if not, just use the most recent one we fetched
      const activeAssign = a.assignments?.find(as => as.status === 'ACTIVE') || a.assignments?.[0];
      assetMap.set(a.serialNumber, {
        id: a.assetCode || a.id,
        name: a.name,
        category: a.category?.name,
        purchaseDate: a.purchaseDate,
        warrantyExpiry: a.warrantyExpiryDate,
        status: a.status,
        assignedAt: activeAssign ? activeAssign.assignedAt : null
      });
    });

    return {
      ...entry,
      cpuDetails: entry.serialNumber ? assetMap.get(entry.serialNumber) : null,
      keyboardDetails: entry.keyboard ? assetMap.get(entry.keyboard) : null,
      mouseDetails: entry.mouse ? assetMap.get(entry.mouse) : null,
      monitorDetails: entry.monitor ? assetMap.get(entry.monitor) : null,
      headsetDetails: entry.headset ? assetMap.get(entry.headset) : null,
      cablesDetails: entry.cables ? assetMap.get(entry.cables) : null,
    };
  }

  @Get()
  async getAll() {
    const inventories = await this.prisma.inventory.findMany();
    const serialNumbers: string[] = [];
    
    for (const inv of inventories) {
      if (inv.serialNumber) serialNumbers.push(inv.serialNumber);
      if (inv.keyboard) serialNumbers.push(inv.keyboard);
      if (inv.mouse) serialNumbers.push(inv.mouse);
      if (inv.monitor) serialNumbers.push(inv.monitor);
      if (inv.headset) serialNumbers.push(inv.headset);
      if (inv.cables) serialNumbers.push(inv.cables);
    }
    
    const assets = await this.prisma.asset.findMany({
      where: { serialNumber: { in: serialNumbers } },
      include: { 
        category: true,
        assignments: {
          orderBy: { assignedAt: 'desc' },
          take: 1
        }
      }
    });
    
    const userIds = assets.flatMap(a => a.assignments.map(assign => assign.assignedById)).filter(Boolean);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, departmentName: true }
    });
    const userMap = new Map();
    users.forEach(u => userMap.set(u.id, u));
    
    const assetMap = new Map();
    assets.forEach(a => {
      const activeAssign = a.assignments?.[0];
      const assignedByUser = activeAssign ? userMap.get(activeAssign.assignedById) : null;
      
      assetMap.set(a.serialNumber, {
        id: a.assetCode || a.id,
        name: a.name,
        category: a.category?.name,
        purchaseDate: a.purchaseDate,
        warrantyExpiry: a.warrantyExpiryDate,
        status: a.status,
        notes: a.notes,
        assignedAt: activeAssign ? activeAssign.assignedAt : null,
        assignedBy: assignedByUser ? `${assignedByUser.email} (${assignedByUser.departmentName || 'Staff'})` : null
      });
    });

    return inventories.map(inv => ({
      ...inv,
      cpuDetails: inv.serialNumber ? assetMap.get(inv.serialNumber) : null,
      keyboardDetails: inv.keyboard ? assetMap.get(inv.keyboard) : null,
      mouseDetails: inv.mouse ? assetMap.get(inv.mouse) : null,
      monitorDetails: inv.monitor ? assetMap.get(inv.monitor) : null,
      headsetDetails: inv.headset ? assetMap.get(inv.headset) : null,
      cablesDetails: inv.cables ? assetMap.get(inv.cables) : null,
    }));
  }
}
