import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Types } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? '',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    if (
      !Types.ObjectId.isValid(payload.sub) ||
      !['job_seeker', 'recruiter'].includes(payload.role) ||
      typeof payload.email !== 'string'
    ) {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}