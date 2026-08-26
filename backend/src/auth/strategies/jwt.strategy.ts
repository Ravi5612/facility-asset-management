import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('FATAL: JWT_SECRET environment variable is not set. App will not start.');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.auth_token || null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; organizationId: string; role: string }) {
    // Check database to ensure user hasn't been disabled/deleted
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: { include: { role: true } }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account disabled');
    }

    const currentRole = user.userRoles[0]?.role?.name || payload.role;

    // This gets attached to request.user on every protected route
    return {
      userId: payload.sub,
      organizationId: payload.organizationId,
      role: currentRole, // FRESH role from database, not from JWT
    };
  }
}
