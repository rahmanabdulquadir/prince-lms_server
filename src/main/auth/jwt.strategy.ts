import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    isSubscribed?: boolean;
  }) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role, // ✅ This is required by AdminGuard
      isSubscribed: payload.isSubscribed, // ✅ Optional: if needed in controller
    };
  }
}
