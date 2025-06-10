import { Injectable } from '@nestjs/common';
import { MailService } from 'src/main/mail/mail.service';

@Injectable()
export class OtpService {
  constructor(private readonly mailService: MailService) {}

  generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
  }

  async sendOtpByEmail(email: string, otp: string) {
    return await this.mailService.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    });
  }

  async sendOtpByPhone(phone: string, otp: string) {
    // integrate Twilio or similar later
    console.log(`Sending SMS to ${phone}: Your OTP is ${otp}`);
    return true;
  }
}
