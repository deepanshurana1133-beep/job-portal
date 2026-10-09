import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

  private transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async sendApplicationStatusEmail(
    to: string,
    jobTitle: string,
    status: 'Accepted' | 'Rejected',
  ) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error(
        'Email notifications require EMAIL_USER and EMAIL_PASSWORD',
      );
    }

    const subject =
      status === 'Accepted'
        ? 'Application Accepted 🎉'
        : 'Application Update';

    const message =
      status === 'Accepted'
        ? `Your application for "${jobTitle}" has been accepted by the recruiter.`
        : `Your application for "${jobTitle}" has been rejected by the recruiter.`;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
    });
  }
}