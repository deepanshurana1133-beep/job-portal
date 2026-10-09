import { Model } from 'mongoose';
import { EmailService } from '../email/email.service';
import { JobDocument } from '../job/schemas/job.schema';
import {
  Application,
  ApplicationDocument,
} from './schemas/application.schema';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  const applicationId = '507f1f77bcf86cd799439011';
  let service: ApplicationService;
  let applicationModel: {
    findById: jest.Mock;
  };
  let emailService: {
    sendApplicationStatusEmail: jest.Mock;
  };
  let application: {
    status: string;
    jobId: { title: string; recruiterId: string };
    userId: { email: string };
    save: jest.Mock;
    toObject: jest.Mock;
  };
  let query: {
    populate: jest.Mock;
    exec: jest.Mock;
  };

  beforeEach(() => {
    application = {
      status: 'Pending',
      jobId: { title: 'Software Engineer', recruiterId: 'recruiter-id' },
      userId: { email: 'registered-applicant@example.com' },
      save: jest.fn(),
      toObject: jest.fn(),
    };

    query = {
      populate: jest.fn(),
      exec: jest.fn().mockResolvedValue(application),
    };
    query.populate.mockReturnValue(query);

    applicationModel = {
      findById: jest.fn().mockReturnValue(query),
    };

    emailService = {
      sendApplicationStatusEmail: jest.fn().mockResolvedValue(undefined),
    };

    application.save.mockResolvedValue(application);
    application.toObject.mockImplementation(() => ({
      _id: 'application-id',
      status: application.status,
      userId: 'applicant-id',
    }));

    service = new ApplicationService(
      applicationModel as unknown as Model<ApplicationDocument>,
        {} as Model<JobDocument>,
        emailService as unknown as EmailService,
    );
  });

  it.each(['Accepted', 'Rejected'] as const)(
    'saves the %s status before notifying the registered applicant',
    async (status) => {
      const result = await service.updateStatus(
        applicationId,
        status,
        'recruiter-id',
        'recruiter',
      );

      expect(application.status).toBe(status);
      expect(application.save).toHaveBeenCalledTimes(1);
      expect(emailService.sendApplicationStatusEmail).toHaveBeenCalledWith(
        'registered-applicant@example.com',
        'Software Engineer',
        status,
      );
      expect(application.save.mock.invocationCallOrder[0]).toBeLessThan(
        emailService.sendApplicationStatusEmail.mock.invocationCallOrder[0],
      );
      expect(result).toMatchObject({ status, emailSent: true });
    },
  );

  it('keeps the status saved and reports email failure', async () => {
    emailService.sendApplicationStatusEmail.mockRejectedValue(
      new Error('SMTP unavailable'),
    );
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const result = await service.updateStatus(
      applicationId,
      'Accepted',
      'recruiter-id',
      'recruiter',
    );

    expect(application.status).toBe('Accepted');
    expect(application.save).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ status: 'Accepted', emailSent: false });
    consoleError.mockRestore();
  });

});
