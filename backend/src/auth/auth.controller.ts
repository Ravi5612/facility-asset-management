import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const { accessToken, refreshToken, user } = await this.authService.login(
      loginDto,
      ipAddress,
      userAgent,
    );

    // Set Refresh Token in HttpOnly Secure Cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: '/auth',
    });

    return {
      success: true,
      accessToken,
      user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/auth' });
    return { success: true, message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userPayload = req['user'] as { userId: string; organizationId: string; role: string };
    
    // Fetch fresh user data from DB
    const user = await this.prisma.user.findFirst({
      where: { id: userPayload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        employeeCode: true,
        departmentName: true,
        accessibleDepartments: true,
        organizationId: true,
        status: true,
      }
    });

    return {
      success: true,
      user: {
        ...user,
        role: userPayload.role // from JWT
      },
    };
  }
}
