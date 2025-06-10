import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    // ✅ Use `sub` instead of `id`
    return this.authService.changePassword(req.user.sub, dto);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP via email or phone' })
  sendOtp(@Body() body: { userId: string; method: 'email' | 'phone' }) {
    return this.authService.sendOtp(body.userId, body.method);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify user OTP' })
  verifyOtp(@Body() body: { userId: string; otp: string }) {
    return this.authService.verifyOtp(body.userId, body.otp);
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP (after 60s)' })
  resendOtp(@Body() body: { userId: string; method: 'email' | 'phone' }) {
    return this.authService.resendOtp(body.userId, body.method);
  }
}
