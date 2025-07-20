import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { randomUUID } from 'crypto';
import { OtpService } from './services/otp.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private otpService: OtpService,
  ) {}

  private async signToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterDto) {
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (emailExists) throw new BadRequestException('Email already in use');

    const phoneExists = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (phoneExists)
      throw new BadRequestException('Phone number already in use');

    const pendingEmail = await this.prisma.pendingUser.findUnique({
      where: { email: dto.email },
    });
    if (pendingEmail)
      throw new BadRequestException('Email already pending verification');

    const pendingPhone = await this.prisma.pendingUser.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (pendingPhone)
      throw new BadRequestException(
        'Phone number already pending verification',
      );

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const pending = await this.prisma.pendingUser.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        password: hashedPassword,
      },
    });

    return {
      status: 'pending',
      message: 'Registration successful. Please verify your account via OTP.',
      userId: pending.id,
    };
  }

  // async login(dto: LoginDto) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { email: dto.email },
  //   });
  //   if (!user) throw new UnauthorizedException('Invalid credentials');

  //   const valid = await bcrypt.compare(dto.password, user.password);
  //   if (!valid) throw new UnauthorizedException('Invalid credentials');

  //   return this.signToken(user);
  // }

  // private async signToken(user: any) {
  //   const payload = { sub: user.id, email: user.email };
  //   const accessToken = await this.jwtService.signAsync(payload);

  //   const { password, ...userWithoutPassword } = user;
  //   return {
  //     user: userWithoutPassword,
  //     accessToken,
  //   };
  // }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      const valid = await bcrypt.compare(dto.password, user.password);
      if (!valid) throw new UnauthorizedException('Invalid credentials');
      return this.signToken(user);
    }

    // Check if they are a pending user instead
    const pendingUser = await this.prisma.pendingUser.findUnique({
      where: { email: dto.email },
    });

    if (pendingUser) {
      const valid = await bcrypt.compare(dto.password, pendingUser.password);
      if (!valid) throw new UnauthorizedException('Invalid credentials');

      // Tell client the user is pending verification
      throw new BadRequestException({
        status: 'pending',
        message: 'Account not verified yet. Please complete OTP verification.',
        userId: pendingUser.id,
      });
    }

    // If not found in both tables
    throw new UnauthorizedException('Invalid credentials');
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new BadRequestException('User not found');

    const token = crypto.randomBytes(32).toString('hex');
    const hashed = await bcrypt.hash(token, 10);

    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        resetToken: hashed,
        resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    await this.mailService.sendResetPasswordEmail(dto.email, token);
    return { message: 'Reset email sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const users = await this.prisma.user.findMany({
      where: {
        resetToken: {
          not: null,
        },
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    const matchedUser = await Promise.any(
      users.map(async (user) => {
        const isValid = await bcrypt.compare(
          dto.token,
          user.resetToken as string,
        );
        if (isValid) return user;
        throw new Error();
      }),
    ).catch(() => null);

    if (!matchedUser) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch)
      throw new BadRequestException('Current password is incorrect');

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
    return { message: 'Password changed successfully' };
  }

  // Called after registration to start OTP verification
  async sendOtp(pendingUserId: string, method: 'email' | 'phone') {
    const user = await this.prisma.pendingUser.findUnique({
      where: { id: pendingUserId },
    });
    if (!user) throw new BadRequestException('Pending user not found');

    const otp = this.otpService.generateOtp();

    await this.prisma.otpVerification.create({
      data: {
        id: randomUUID(),
        otp,
        userId: pendingUserId,
        method,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
    });

    if (method === 'email') {
      await this.otpService.sendOtpByEmail(user.email, otp);
    } else {
      await this.otpService.sendOtpByPhone(user.phoneNumber, otp);
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(pendingUserId: string, otp: string) {
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        userId: pendingUserId,
        otp,
        expiresAt: { gte: new Date() },
        verifiedAt: null,
      },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as verified
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    });

    // Fetch the pending user
    const pending = await this.prisma.pendingUser.findUnique({
      where: { id: pendingUserId },
    });

    if (!pending) {
      throw new BadRequestException('Pending user not found');
    }

    // Create actual user
    const user = await this.prisma.user.create({
      data: {
        fullName: pending.fullName,
        email: pending.email,
        phoneNumber: pending.phoneNumber,
        password: pending.password,
        // isVerified: true, // ✅ Optional: Set user as verified
      },
    });

    // First, delete all OTPs linked to pendingUserId to avoid FK constraint issue
    await this.prisma.otpVerification.deleteMany({
      where: { userId: pendingUserId },
    });

    // Then delete the pending user
    await this.prisma.pendingUser.delete({
      where: { id: pendingUserId },
    });

    const tokenData = await this.signToken(user);

    return {
      status: 'verified',
      message: 'OTP verified successfully. User registered.',
      ...tokenData,
    };
  }

  async resendOtp(userId: string, method: 'email' | 'phone') {
    // Optional: Enforce 60-second delay
    const lastOtp = await this.prisma.otpVerification.findFirst({
      where: {
        userId,
        method,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp && Date.now() - new Date(lastOtp.createdAt).getTime() < 60000) {
      throw new BadRequestException('Please wait before resending OTP');
    }

    return this.sendOtp(userId, method);
  }
}