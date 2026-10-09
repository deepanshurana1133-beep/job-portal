import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { EmailService } from '../email/email.service';
import { Job, JobDocument } from '../job/schemas/job.schema';
import { UserRole } from '../auth/roles';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
    private readonly emailService: EmailService,
  ) {}

  async applyForJob(jobId: string, userId: string, resume: string) {
    if (!Types.ObjectId.isValid(jobId)) {
      throw new NotFoundException('Job not found');
    }

    const jobExists = await this.jobModel.exists({ _id: jobId });
    if (!jobExists) {
      throw new NotFoundException('Job not found');
    }

    const application = new this.applicationModel({
      jobId: new Types.ObjectId(jobId),
      userId: new Types.ObjectId(userId),
      resume,
      status: 'Pending',
    });

    return application.save();
  }

  async getMyApplications(userId: string) {
    return this.applicationModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('jobId')
      .exec();
  }

  async getApplicationById(id: string, userId: string, role: UserRole) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Application not found');
    }

    const application = await this.applicationModel
      .findById(id)
      .populate('jobId')
      .populate({ path: 'userId', select: '-password' })
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = application.jobId as unknown as Job | null;
    const ownsApplication =
      role === 'job_seeker' && application.userId?._id?.toString() === userId;
    const ownsJob =
      role === 'recruiter' && job?.recruiterId?.toString() === userId;

    if (!ownsApplication && !ownsJob) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateStatus(
    id: string,
    status: 'Pending' | 'Accepted' | 'Rejected',
    userId: string,
    role: UserRole,
  ) {
    if (role !== 'recruiter') {
      throw new ForbiddenException(
        'Only recruiters can update application status',
      );
    }
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Application not found');
    }

    const application = await this.applicationModel
      .findById(id)
      .populate('jobId')
      .populate({ path: 'userId', select: '-password' })
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = application.jobId as unknown as Job | null;
    if (!job || job.recruiterId.toString() !== userId) {
      throw new NotFoundException('Application not found');
    }

    application.status = status;
    const savedApplication = await application.save();
    const applicant = application.userId as unknown as {
      email?: string;
      name?: string;
    } | null;

    if (
      (status === 'Accepted' || status === 'Rejected') &&
      applicant?.email &&
      applicant.name &&
      job.title
    ) {
      try {
        await this.emailService.sendApplicationStatusEmail(
          applicant.email,
          applicant.name,
          job.title,
          status,
        );
      } catch {
        this.logger.warn(
          `Application status saved, but notification email failed for application ${id}`,
        );
      }
    }

    return savedApplication;
  }

  async getRecruiterApplications(recruiterId: string) {
    const applications = await this.applicationModel
      .find()
      .populate({
        path: 'jobId',
        match: { recruiterId },
      })
      .populate({ path: 'userId', select: '-password' })
      .exec();

    return applications.filter((application) => application.jobId !== null);
  }

  async viewResume(id: string, userId: string, role: UserRole, res: Response) {
    if (role !== 'recruiter') {
      throw new ForbiddenException('Only recruiters can view resumes');
    }
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Application not found');
    }

    const application = await this.applicationModel
      .findById(id)
      .populate('jobId')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = application.jobId as unknown as Job | null;
    if (!job || job.recruiterId.toString() !== userId) {
      throw new NotFoundException('Application not found');
    }

    const filePath = path.join(
      process.cwd(),
      'uploads',
      'resumes',
      application.resume,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Resume file not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');

    return res.sendFile(filePath, (error) => {
      if (error) {
        this.logger.warn('Resume file could not be sent');
      }
    });
  }
}
