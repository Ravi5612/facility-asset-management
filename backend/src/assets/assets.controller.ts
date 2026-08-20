import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
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
  getCategories(@Req() req: Request) {
    const user = req['user'] as any;
    return this.assetsService.getCategories(user.organizationId);
  }

  @Post('categories')
  createCategory(@Req() req: Request, @Body() dto: CreateAssetCategoryDto) {
    const user = req['user'] as any;
    return this.assetsService.createCategory(user.organizationId, dto);
  }

  @Get('department')
  getDepartmentAssets(@Req() req: Request) {
    const user = req['user'] as any;
    // user.userId is the ID attached by JwtStrategy
    return this.assetsService.getDepartmentAssets(user.organizationId, user.userId);
  }

  @Post()
  createAsset(@Req() req: Request, @Body() dto: CreateAssetDto) {
    const user = req['user'] as any;
    return this.assetsService.createAsset(user.organizationId, user.userId, dto);
  }

  @Post(':id/assign')
  @Roles('HOD')
  assignAsset(@Req() req: Request, @Param('id') assetId: string, @Body() dto: AssignAssetDto) {
    const user = req['user'] as any;
    return this.assetsService.assignAsset(user.organizationId, assetId, dto.employeeId, user.userId, dto);
  }
}
