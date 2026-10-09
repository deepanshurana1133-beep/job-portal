import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from '../job/schemas/job.schema';

import {
  Application,
  ApplicationDocument,
} from './schemas/application.schema';
import { User } from '../user/schemas/user.schema';

import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

import { EmailService } from '../email/email.service';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,

    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,

    private emailService: EmailService,
  ) {}

  // =========================
  // Apply For Job
  // =========================
  async applyForJob(
    jobId: string,
    userId: string,
    resume: string,
  ) {
    if (!Types.ObjectId.isValid(jobId)) {
      throw new BadRequestException('Invalid job ID');
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

    try {
      return await application.save();
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('You have already applied for this job');
      }
      throw error;
    }
  }

  // =========================
  // Get My Applications
  // =========================
  async getMyApplications(userId: string) {
    return this.applicationModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .populate('jobId', 'title company location salary jobType skills description')
      .exec();
  }

  // =========================
  // Get Application By ID
  // =========================
  async getApplicationById(
    id: string,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    const application = await this.applicationModel
      .findOne({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .populate('jobId', 'title company location salary jobType skills description')
      .populate('userId', 'name email')
      .exec();

    if (!application) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    return application;
  }

  // =========================
  // Update Application Status
  // =========================
  async updateStatus(
    id: string,
    status: 'Accepted' | 'Rejected',
    userId: string,
    role: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    if (status !== 'Accepted' && status !== 'Rejected') {
      throw new BadRequestException(
        'Application status must be Accepted or Rejected',
      );
    }

    // Only recruiter can update status
    if (role !== 'recruiter') {
      throw new UnauthorizedException(
        'Only recruiters can update application status',
      );
    }

    const application = await this.applicationModel
      .findById(id)
      .populate<{ jobId: Job }>('jobId')
      .populate<{ userId: User }>('userId', 'email')
      .exec();

    if (!application) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    const job = application.jobId;
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Recruiter can update only their own job applications
    if (job.recruiterId.toString() !== userId) {
      throw new UnauthorizedException(
        'You can only update applications for your own jobs',
      );
    }

    // Update status
    application.status = status;

    // Save status in database first
    const savedApplication =
      await application.save();

    const applicant = application.userId;
    let emailSent = false;

    // =========================
    // Send Email Notification
    // =========================
    if (applicant?.email && job.title) {
      try {
        await this.emailService.sendApplicationStatusEmail(
          applicant.email,
          job.title,
          status,
        );

        emailSent = true;
      } catch (error) {
        console.error(
          'Email notification failed',
          error instanceof Error ? error.name : 'Unknown error',
        );
      }
    } else {
      console.error(
        'Email notification failed: applicant email or job title is unavailable',
      );
    }

    return {
      ...savedApplication.toObject({ depopulate: true }),
      emailSent,
    };
  }

  // =========================
  // Get Recruiter Applications
  // =========================
  async getRecruiterApplications(
    recruiterId: string,
  ) {
    const applications =
      await this.applicationModel
        .find()
        .populate({
          path: 'jobId',
          match: {
            recruiterId: new Types.ObjectId(
              recruiterId,
            ),
          },
        })
        .populate({
          path: 'userId',
          select: 'name email',
        });

    return applications.filter(
      (application) =>
        application.jobId !== null,
    );
  }

  // =========================
  // View Resume
  // =========================
  async viewResume(
    id: string,
    userId: string,
    role: string,
    res: Response,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application ID');
    }

    const application =
      await this.applicationModel
        .findById(id)
        .populate('jobId')
        .exec();

    if (!application) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    const job = application.jobId as unknown as Job | null;
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Recruiter can view only applications
    // for their own jobs
    if (
      role === 'recruiter' &&
      job.recruiterId.toString() !== userId
    ) {
      throw new UnauthorizedException(
        'You can only view resumes for your own jobs',
      );
    }

    const isGeneratedFilename =
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}\.pdf$/i.test(
        application.resume,
      );
    const isLegacyFilename =
        /^\d+-[^/\\\u0000-\u001f<>:"|?*]+\.pdf$/i.test(application.resume);
    if (
      path.basename(application.resume) !== application.resume ||
      (!isGeneratedFilename && !isLegacyFilename)
    ) {
      throw new NotFoundException('Resume file not found');
    }

    const uploadDirectory = path.resolve(
      process.cwd(),
      'uploads',
      'resumes',
    );
    const filePath = path.resolve(uploadDirectory, application.resume);
    if (path.dirname(filePath) !== uploadDirectory) {
      throw new NotFoundException('Resume file not found');
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        'Resume file not found',
      );
    }

    res.setHeader(
      'Content-Type',
      'application/pdf',
    );

    res.setHeader(
      'Content-Disposition',
      'inline',
    );

    return res.sendFile(
      filePath,
      (error) => {
        if (error) {
          console.error(
            'Resume send error:',
            error,
          );
        }
      },
    );
  }
}