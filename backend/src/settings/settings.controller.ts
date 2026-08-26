import { Controller, Get, Put, Body, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Controller('settings')
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  @Get('public-theme')
  async getPublicTheme(@Query('orgId') orgId: string) {
    if (!orgId) {
      return { themeColor: 'blue' }; // Default if not provided
    }
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { themeColor: true }
    });
    return { themeColor: org?.themeColor || 'blue' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Put('theme')
  async updateTheme(@Body() body: UpdateThemeDto, @Req() req: any) {
    const user = req.user;
    
    await this.prisma.organization.update({
      where: { id: user.organizationId },
      data: { themeColor: body.themeColor },
    });
    
    return { success: true, themeColor: body.themeColor };
  }
}
