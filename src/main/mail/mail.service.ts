import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
