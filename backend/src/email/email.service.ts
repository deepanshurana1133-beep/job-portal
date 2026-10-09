import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendApplicationStatusEmail(
    to: string,
    applicantName: string,
    jobTitle: string,
    status: 'Accepted' | 'Rejected',
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    if (!emailUser || !emailPassword) {
      throw new Error('Email service is not configured');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    const subject =
      status === 'Accepted'
        ? `Application Accepted – ${jobTitle}`
        : `Application Update – ${jobTitle}`;
    const message =
      status === 'Accepted'
        ? `Hello ${applicantName},

Congratulations! Your application for ${jobTitle} has been accepted.

The recruiter has reviewed your application and selected you for the next step.

Regards,
Job Portal Team`
        : `Hello ${applicantName},

Thank you for applying for ${jobTitle}.

After reviewing your application, the recruiter has decided not to proceed with your application at this time.

We appreciate your interest and wish you success in your job search.

Regards,
Job Portal Team`;

    try {
      await transporter.sendMail({
        from: emailUser,
        to,
        subject,
        text: message,
      });
    } catch {
      this.logger.warn('Application status email could not be sent');
      throw new Error('Application status email could not be sent');
    }
  }
}
