import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('EmailService', () => {
  const sendMail = jest.fn();
  const createTransport = jest.mocked(nodemailer.createTransport);
  let service: EmailService;
  let getConfig: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    sendMail.mockResolvedValue({});
    createTransport.mockReturnValue({
      sendMail,
    } as unknown as nodemailer.Transporter);
    getConfig = jest.fn((key: string) => {
      const values: Record<string, string> = {
        EMAIL_USER: 'sender@example.com',
        EMAIL_PASSWORD: 'test-secret',
      };
      return values[key];
    });
    service = new EmailService({
      get: getConfig,
    } as unknown as ConfigService);
  });

  it('sends the accepted message using configured sender credentials', async () => {
    await service.sendApplicationStatusEmail(
      'applicant@example.com',
      'Alex Applicant',
      'Senior Engineer',
      'Accepted',
    );

    expect(createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'sender@example.com',
        pass: 'test-secret',
      },
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: 'sender@example.com',
      to: 'applicant@example.com',
      subject: 'Application Accepted – Senior Engineer',
      text: `Hello Alex Applicant,

Congratulations! Your application for Senior Engineer has been accepted.

The recruiter has reviewed your application and selected you for the next step.

Regards,
Job Portal Team`,
    });
  });

  it('sends the rejected message with the requested professional copy', async () => {
    await service.sendApplicationStatusEmail(
      'applicant@example.com',
      'Alex Applicant',
      'Senior Engineer',
      'Rejected',
    );

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'applicant@example.com',
        subject: 'Application Update – Senior Engineer',
        text: `Hello Alex Applicant,

Thank you for applying for Senior Engineer.

After reviewing your application, the recruiter has decided not to proceed with your application at this time.

We appreciate your interest and wish you success in your job search.

Regards,
Job Portal Team`,
      }),
    );
  });

  it('does not expose transport errors or credentials when delivery fails', async () => {
    sendMail.mockRejectedValue(new Error('credential test-secret leaked'));

    await expect(
      service.sendApplicationStatusEmail(
        'applicant@example.com',
        'Alex Applicant',
        'Senior Engineer',
        'Rejected',
      ),
    ).rejects.toThrow('Application status email could not be sent');
  });

  it('fails closed when sender credentials are absent', async () => {
    getConfig.mockReturnValue(undefined);

    await expect(
      service.sendApplicationStatusEmail(
        'applicant@example.com',
        'Alex Applicant',
        'Senior Engineer',
        'Accepted',
      ),
    ).rejects.toThrow('Email service is not configured');
    expect(sendMail).not.toHaveBeenCalled();
  });
});
