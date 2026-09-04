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
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { refreshCookieOptions } from './auth-cookie';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Brute-force protection: max 5 login attempts / min
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
    res.cookie('refresh_token', refreshToken, refreshCookieOptions());

    // Set Access Token in HttpOnly Secure Cookie to prevent XSS
    res.cookie('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',   // Stricter than 'lax' — internal app doesn't need cross-site
      maxAge: 15 * 60 * 1000, // 15 mins in ms
      path: '/',
    });

    return {
      success: true,
      user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('auth_token', { path: '/' });
    return { success: true, message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle() // Called on every page refresh — don't throttle session validation
  @Get('me')
  async getMe(@Req() req: Request) {
    const userPayload = req['user'] as { userId: string; organizationId: string; role: string };
    
    // Fetch fresh user data from DB
    const user = await this.prisma.user.findFirst({
      where: { id: userPayload.userId },
      select: {
        id: true,
        email: true,
        employee: {
          select: {
            employeeCode: true,
            profilePhoto: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } }
          }
        },
        organizationId: true,
        status: true,
        organization: { select: { themeColor: true } },
      }
    });

    // Fallback: Fetch employee record using email since user.employeeId relation might be null
    const employeeRecord = user?.email ? await this.prisma.employee.findFirst({
      where: { email: user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        employeeCode: true,
        designation: true,
        joiningDate: true,
        profilePhoto: true,
        departmentId: true,
        status: true,
        department: { select: { name: true } }
      }
    }) : null;

    return {
      success: true,
      user: {
        ...user,
        employee: employeeRecord,
        role: userPayload.role, // from JWT
        themeColor: user?.organization?.themeColor || "blue"
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Brute-force protection on password check
  async verifyPassword(@Req() req: Request, @Body() body: import('./dto/verify-password.dto').VerifyPasswordDto) {
    const userPayload = req['user'] as { userId: string };
    await this.authService.verifyPassword(userPayload.userId, body.password);
    return { success: true };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Protect against refresh token brute force
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    
    if (!refreshToken) {
      return { success: false, message: 'No refresh token found' };
    }

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    try {
      const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refreshTokens(
        refreshToken,
        ipAddress,
        userAgent,
      );

      res.cookie('auth_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 mins in ms
        path: '/',
      });

      res.cookie('refresh_token', newRefreshToken, refreshCookieOptions());

      return {
        success: true,
        user,
      };
    } catch (error) {
      return { success: false, message: 'Invalid refresh token' };
    }
  }

}
