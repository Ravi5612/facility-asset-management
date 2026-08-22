import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('settings')
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  @Get('public-theme')
  async getPublicTheme() {
    const org = await this.prisma.organization.findFirst({
      select: { themeColor: true }
    });
    return { themeColor: org?.themeColor || 'blue' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('theme')
  async updateTheme(@Body('themeColor') themeColor: string, @Req() req: any) {
    const user = req.user;
    if (!user.role || !user.role.includes('SUPER')) {
      return { success: false, message: 'Unauthorized' };
    }
    
    await this.prisma.organization.update({
      where: { id: user.organizationId },
      data: { themeColor },
    });
    
    return { success: true, themeColor };
  }
}
