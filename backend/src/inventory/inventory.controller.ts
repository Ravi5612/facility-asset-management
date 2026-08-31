import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('inventory')
export class InventoryController {
  constructor(private prisma: PrismaService) {}

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
    return entry || {};
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
          where: { status: 'ACTIVE' },
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
