import { Controller, Get, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
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
  async getBySeat(@Query('seatNumber') seatNumber: string, @Req() req: any) {
    if (!seatNumber) return {};
    const user = req.user as { organizationId: string };
    
    const seat = await this.prisma.location.findFirst({
      where: { 
        name: { equals: seatNumber, mode: 'insensitive' }, 
        type: 'DESK', 
        organizationId: user.organizationId 
      },
      include: { assets: true }
    });

    if (!seat) {
      throw new NotFoundException("Seat not found in inventory. Please add it in the Locations/Inventory first.");
    }

    const cpu = seat.assets.find(a => a.name.includes('CPU') || a.hardwareDetails) || seat.assets[0];
    const hardware = (cpu?.hardwareDetails as any) || {};

    return {
      exists: true,
      hostname: cpu?.name || "",
      ipAddress: hardware.ip || hardware.ipAddress || "",
      macAddress: hardware.mac || hardware.macAddress || "",
    };
  }

  @Get()
  async getAll(@Req() req: any) {
    const user = req.user as { organizationId: string };
    
    // Fetch all locations of type DESK with all assigned assets and their categories
    const desks = await this.prisma.location.findMany({
      where: { type: 'DESK', organizationId: user.organizationId },
      include: {
        parent: { include: { parent: true } },
        assets: {
          where: { status: { not: 'RETIRED' } },
          include: { category: true }
        },
      }
    });

    const result = desks.map(desk => {
      // Helper to find asset by category name keyword
      const findAsset = (keyword: string) =>
        desk.assets.find(a => a.category?.name?.toLowerCase().includes(keyword.toLowerCase()));

      const cpu = findAsset('cpu') || desk.assets.find(a => (a.hardwareDetails as any)?.processor) || desk.assets[0];
      const mouseAsset = findAsset('mouse');
      const keyboardAsset = findAsset('keyboard');
      const monitorAsset = findAsset('monitor');
      const headsetAsset = findAsset('headset');
      const cableAsset = findAsset('cable') || findAsset('accessory');

      const hardware = (cpu?.hardwareDetails as any) || {};
      
      const rawFloor = desk.parent?.parent?.name || hardware.floor || '-';
      let floorStr = rawFloor;
      if (rawFloor.toUpperCase() === '1ST') floorStr = '1st Floor';
      else if (rawFloor.toUpperCase() === '2ND') floorStr = '2nd Floor';
      else if (rawFloor.toUpperCase() === '3RD') floorStr = '3rd Floor';
      else if (rawFloor.toUpperCase() === '4TH') floorStr = '4th Floor';
      else if (rawFloor.toUpperCase() === '5TH') floorStr = '5th Floor';
      else if (rawFloor.toUpperCase() === '6TH') floorStr = '6th Floor';
      else if (rawFloor.toUpperCase().includes('BASEMENT')) floorStr = 'Basement';
      else if (rawFloor.toUpperCase().includes('GROUND')) floorStr = 'Ground (0)';

      return {
        id: desk.id,
        seatNumber: desk.name,
        floor: floorStr,
        department: desk.parent?.name || hardware.process || '-',
        hostname: cpu?.name || '-',
        assetCode: cpu?.assetCode || '-',
        serialNumber: cpu?.serialNumber || hardware.serialNumber || '-',
        purchaseDate: cpu?.purchaseDate ? cpu.purchaseDate.toISOString().split('T')[0] : '-',
        warrantyExpiryDate: cpu?.warrantyExpiryDate ? cpu.warrantyExpiryDate.toISOString().split('T')[0] : '-',
        bitlocker: hardware.bitlocker || '-',
        symantec: hardware.symantec || '-',
        make: hardware.make || '-',
        model: hardware.model || '-',
        processor: hardware.processor || '-',
        ram: hardware.ram || '-',
        hdd: hardware.drive || '-',
        ipAddress: hardware.ip || '-',
        macAddress: hardware.mac || '-',
        // Peripherals — show asset code/name if assigned, else '-'
        mouse: mouseAsset ? (mouseAsset.assetCode || mouseAsset.name) : '-',
        mouseDetails: mouseAsset ? { name: mouseAsset.name, code: mouseAsset.assetCode, serial: mouseAsset.serialNumber, purchaseDate: mouseAsset.purchaseDate?.toISOString().split('T')[0], warrantyExpiryDate: mouseAsset.warrantyExpiryDate?.toISOString().split('T')[0] } : null,
        keyboard: keyboardAsset ? (keyboardAsset.assetCode || keyboardAsset.name) : '-',
        keyboardDetails: keyboardAsset ? { name: keyboardAsset.name, code: keyboardAsset.assetCode, serial: keyboardAsset.serialNumber, purchaseDate: keyboardAsset.purchaseDate?.toISOString().split('T')[0], warrantyExpiryDate: keyboardAsset.warrantyExpiryDate?.toISOString().split('T')[0] } : null,
        monitor: monitorAsset ? (monitorAsset.assetCode || monitorAsset.name) : '-',
        monitorDetails: monitorAsset ? { name: monitorAsset.name, code: monitorAsset.assetCode, serial: monitorAsset.serialNumber, purchaseDate: monitorAsset.purchaseDate?.toISOString().split('T')[0], warrantyExpiryDate: monitorAsset.warrantyExpiryDate?.toISOString().split('T')[0] } : null,
        headset: headsetAsset ? (headsetAsset.assetCode || headsetAsset.name) : '-',
        headsetDetails: headsetAsset ? { name: headsetAsset.name, code: headsetAsset.assetCode, serial: headsetAsset.serialNumber, purchaseDate: headsetAsset.purchaseDate?.toISOString().split('T')[0], warrantyExpiryDate: headsetAsset.warrantyExpiryDate?.toISOString().split('T')[0] } : null,
        cables: cableAsset ? (cableAsset.assetCode || cableAsset.name) : '-',
      };
    });

    return result;
  }
}
