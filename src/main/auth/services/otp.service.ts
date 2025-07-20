import { Injectable } from '@nestjs/common';
import { MailService } from 'src/main/mail/mail.service';
import { TwilioService } from 'src/main/twilio/twilio.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly mailService: MailService,
    private readonly twilioService: TwilioService,
  ) {}

  generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
  }

  async sendOtpByEmail(email: string, otp: string) {
    return this.mailService.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    });
  }

  async sendOtpByPhone(phone: string, otp: string) {
    const message = `Your OTP code is ${otp}`;
    return this.twilioService.sendSms(phone, message);
  }
}