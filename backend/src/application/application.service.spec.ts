import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Application } from './schemas/application.schema';
import { Job } from '../job/schemas/job.schema';
import { EmailService } from '../email/email.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  const applicationModel = {
    findById: jest.fn(),
  };
  const jobModel = {};
  const emailService = {
    sendApplicationStatusEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getModelToken(Application.name),
          useValue: applicationModel,
        },
        {
          provide: getModelToken(Job.name),
          useValue: jobModel,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not let a recruiter update an application for another recruiter job', async () => {
    const applicationId = '507f1f77bcf86cd799439011';
    const application = {
      jobId: { recruiterId: '507f191e810c19729de860ea', title: 'Engineer' },
      userId: { email: 'applicant@example.com' },
      save: jest.fn(),
    };
    const query = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(application),
    };
    applicationModel.findById.mockReturnValue(query);

    await expect(
      service.updateStatus(
        applicationId,
        'Accepted',
        '507f191e810c19729de860eb',
        'recruiter',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(application.save).not.toHaveBeenCalled();
  });

  it.each(['Accepted', 'Rejected'] as const)(
    'returns the saved %s status even when the notification email fails',
    async (status) => {
      const applicationId = '507f1f77bcf86cd799439011';
      const recruiterId = '507f191e810c19729de860ea';
      const savedApplication = {
        status,
      };
      const application = {
        jobId: { recruiterId, title: 'Engineer' },
        userId: { email: 'applicant@example.com', name: 'Applicant Name' },
        status: 'Pending',
        save: jest.fn().mockResolvedValue(savedApplication),
      };
      const query = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(application),
      };
      applicationModel.findById.mockReturnValue(query);
      emailService.sendApplicationStatusEmail.mockRejectedValue(
        new Error('SMTP credentials must not be returned'),
      );

      await expect(
        service.updateStatus(applicationId, status, recruiterId, 'recruiter'),
      ).resolves.toBe(savedApplication);
      expect(application.status).toBe(status);
      expect(application.save).toHaveBeenCalledTimes(1);
      expect(emailService.sendApplicationStatusEmail).toHaveBeenCalledWith(
        'applicant@example.com',
        'Applicant Name',
        'Engineer',
        status,
      );
    },
  );
});
