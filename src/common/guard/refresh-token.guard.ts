import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('🛡️ RefreshTokenGuard activated');

    const request = context.switchToHttp().getRequest();
    const token =
      request.headers['x-refresh-token'] || request.cookies?.refreshToken;

    console.log('🔍 Refresh token found in headers or cookies:', token);

    if (!token) {
      console.log('❌ No refresh token provided');
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      console.log('✅ Refresh token successfully verified:', decoded);

      request.user = decoded;
      return true;
    } catch (err) {
      console.log('⛔ Invalid refresh token:', err.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
