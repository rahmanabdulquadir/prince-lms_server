import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { OtpService } from './services/otp.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy, MailService, JwtAuthGuard, OtpService],
  controllers: [AuthController],
})
export class AuthModule {}
