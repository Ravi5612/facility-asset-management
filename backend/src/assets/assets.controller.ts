import { Controller, Get, Post, Body, UseGuards, Req, Param, Query, ForbiddenException } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateAssetCategoryDto, CreateAssetDto, AssignAssetDto } from './dto/asset.dto';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('categories')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD')
  async getCategories(@Req() req: Request) {
    const user = req['user'] as any;
    return this.assetsService.getCategories(user.organizationId, user.userId, user.role);
  }

  @Post('categories')
  @Roles('HOD')
  async createCategory(@Req() req: Request, @Body() dto: CreateAssetCategoryDto) {
    const user = req['user'] as any;
    return this.assetsService.createCategory(user.organizationId, user.userId, dto);
  }

  @Get('department')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD')
  getDepartmentAssets(@Req() req: Request, @Query('viewMode') viewMode?: string) {
    const user = req['user'] as any;
    return this.assetsService.getDepartmentAssets(user.organizationId, user.userId, viewMode);
  }

  @Post()
  @Roles('HOD')
  async createAsset(@Req() req: Request, @Body() dto: CreateAssetDto) {
    const user = req['user'] as any;
    return this.assetsService.createAsset(user.organizationId, user.userId, dto);
  }

  @Post(':id/assign')
  @Roles('HOD')
  assignAsset(@Req() req: Request, @Param('id') assetId: string, @Body() dto: AssignAssetDto) {
    const user = req['user'] as any;
    return this.assetsService.assignAsset(user.organizationId, assetId, dto.employeeId, user.userId, dto);
  }

  @Post(':id/shift')
  @Roles('HOD')
  shiftAsset(@Req() req: Request, @Param('id') assetId: string, @Body() dto: any) {
    const user = req.user as any;
    return this.assetsService.shiftAsset(user.organizationId, assetId, user.userId, dto);
  }

    @Post(':id/status')
  @Roles('HOD')
  updateAssetStatus(@Req() req: Request, @Param('id') assetId: string, @Body() dto: import('./dto/asset.dto').UpdateAssetStatusDto) {
    const user = req.user as any;
    return this.assetsService.updateAssetStatus(user.organizationId, assetId, user.userId, dto);
  }

  @Get('assigned-to-me')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD', 'EMPLOYEE')
  getAssignedToMeAssets(@Req() req: Request) {
    const user = req['user'] as any;
    return this.assetsService.getAssignedToMeAssets(user.userId, user.organizationId);
  }

  @Get('inventory-log')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'HOD')
  getInventoryLog(
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const user = req['user'] as any;
    return this.assetsService.getInventoryLog(user.organizationId, from, to);
  }
}
