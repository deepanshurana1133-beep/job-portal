import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly transporter?: nodemailer.Transporter;

  constructor() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      console.warn(
        'Email notifications are disabled: configure EMAIL_USER and EMAIL_PASSWORD',
      );
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.transporter) {
      return;
    }

    try {
      await this.transporter.verify();
      console.log('Email transport is ready');
    } catch {
      console.error(
        'Email transport verification failed; application status updates will continue without email delivery',
      );
    }
  }

  async sendApplicationStatusEmail(
    to: string,
    jobTitle: string,
    status: 'Accepted' | 'Rejected',
  ) {
    const subject =
      status === 'Accepted'
        ? 'Your application has been accepted'
        : 'Update on your job application';

    const message =
      status === 'Accepted'
        ? `Dear Applicant,\n\nWe are pleased to inform you that your application for "${jobTitle}" has been accepted. The recruitment team will be in touch with you regarding the next steps.\n\nThank you for your interest.\n\nRegards,\nRecruitment Team`
        : `Dear Applicant,\n\nThank you for your interest in the "${jobTitle}" position. After careful consideration, we are unable to move forward with your application at this time. We appreciate the time you invested and encourage you to apply for future opportunities.\n\nWe wish you success in your job search.\n\nRegards,\nRecruitment Team`;

    if (!this.transporter || !process.env.EMAIL_USER) {
      throw new Error('Email service is not configured');
    }

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
    });
  }
}