// 



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

  // Generic sendMail method for sending emails
  async sendMail(options: { to: string; subject: string; text?: string; html?: string }) {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text || '', // Fallback to empty string if text is not provided
      html: options.html || '', // Fallback to empty string if html is not provided
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Specific method for sending reset password emails
  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3000/user-create-password?token=${token}`;
    const mailOptions = {
      to: email,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
      `,
    };

    await this.sendMail(mailOptions);
  }

  // Optional: Specific method for sending OTP emails
  async sendOtpEmail(email: string, otp: string) {
    const mailOptions = {
      to: email,
      subject: 'Your OTP Code',
      html: `
        <p>Your OTP code is <strong>${otp}</strong>.</p>
        <p>This code is valid for 10 minutes.</p>
      `,
    };

    await this.sendMail(mailOptions);
  }
}