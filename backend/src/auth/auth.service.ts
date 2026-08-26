import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = loginDto;

    // 1. Find User (Include roles for JWT payload)
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: {
        userRoles: {
          include: { role: true },
        },
        organization: { select: { themeColor: true } },
      },
    });

    // Generic error to prevent user enumeration
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is disabled or suspended. Please contact admin.');
    }

    // 3. Compare Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.prisma.auditLog.create({
        data: {
          organizationId: user.organizationId,
          actorUserId: user.id,
          action: 'LOGIN_FAILED',
          entity: 'User',
          entityId: user.id,
          ipAddress: ipAddress || 'Unknown',
          userAgent: userAgent || 'Unknown',
        }
      }).catch(() => {}); // ignore audit log errors to not break response

      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Generate Tokens
    // Extract primary role (or default to something)
    const primaryRole = user.userRoles[0]?.role?.name || 'USER';

    const payload = {
      sub: user.id,
      organizationId: user.organizationId,
      role: primaryRole,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    // Generate secure random refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Save refresh token to DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
        ipAddress,
        deviceInfo: userAgent,
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 5. Return safe user data + tokens
    return {
      accessToken,
      refreshToken, // Will be set in HttpOnly cookie by controller
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: primaryRole,
        departmentName: user.departmentName,
      },
    };
  }

  async verifyPassword(userId: string, passwordAttempt: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const isPasswordValid = await bcrypt.compare(passwordAttempt, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Incorrect password');
    return true;
  }

  async refreshTokens(refreshToken: string, ipAddress?: string, userAgent?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: {
        user: {
          include: {
            userRoles: { include: { role: true } },
            organization: { select: { themeColor: true } },
          },
        },
      },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Reuse detection
    if (tokenRecord.revokedAt !== null) {
      // Suspected token theft. Revoke ALL tokens for this user.
      await this.prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revokedAt: new Date() },
      });
      // Also log this security event
      await this.prisma.auditLog.create({
        data: {
          organizationId: tokenRecord.user.organizationId,
          actorUserId: tokenRecord.userId,
          action: 'LOGIN_FAILED', // Reusing this action for auth failures
          entity: 'RefreshToken',
          entityId: tokenRecord.id,
          ipAddress: ipAddress || 'Unknown',
          userAgent: userAgent || 'Unknown',
          newValue: { reason: 'Token reuse detected' }
        }
      }).catch(() => {});
      throw new UnauthorizedException('Security Alert: Suspicious token reuse detected. All sessions revoked.');
    }

    const user = tokenRecord.user;

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account disabled');
    }

    // Generate new access token
    const primaryRole = user.userRoles[0]?.role?.name || 'USER';
    const payload = {
      sub: user.id,
      organizationId: user.organizationId,
      role: primaryRole,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // ROTATION: Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Generate NEW refresh token
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt,
        ipAddress,
        deviceInfo: userAgent,
      }
    });

    return { 
      accessToken, 
      refreshToken: newRefreshToken, 
      user: { ...user, themeColor: user.organization?.themeColor || "blue" } 
    };
  }
  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }
}
