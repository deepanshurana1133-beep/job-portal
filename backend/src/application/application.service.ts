import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Application,
  ApplicationDocument,
} from './schemas/application.schema';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { EmailService } from '../email/email.service';
@Injectable()
export class ApplicationService {
 constructor(
  @InjectModel(Application.name)
  private applicationModel: Model<ApplicationDocument>,

  private emailService: EmailService,
) {}

  async applyForJob(
    jobId: string,
    userId: string,
    resume: string,
  ) {
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
      .find({
        userId: new Types.ObjectId(userId),
      })
      .populate('jobId')
      .exec();
  }

  async getApplicationById(id: string, userId: string) {
  const application = await this.applicationModel
    .findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    })
    .populate('jobId')
    .populate('userId')
    .exec();

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  return application;
}

  async updateStatus(
  id: string,
  status: 'Pending' | 'Accepted' | 'Rejected',
  userId: string,
  role: string,
) {
  if (role !== 'recruiter') {
    throw new UnauthorizedException(
      'Only recruiters can update application status',
    );
  }

  const application = await this.applicationModel
    .findById(id)
    .populate('jobId')
    .populate('userId')
    .exec();

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  const job = application.jobId as any;

  if (job.recruiterId.toString() !== userId) {
    throw new UnauthorizedException(
      'You can only update applications for your own jobs',
    );
  }

  application.status = status;

  const savedApplication = await application.save();

  const user = application.userId as any;

  if (
    (status === 'Accepted' || status === 'Rejected') &&
    user?.email &&
    job?.title
  ) {
    await this.emailService.sendApplicationStatusEmail(
      user.email,
      job.title,
      status,
    );
  }

  return savedApplication;
}
async getRecruiterApplications(recruiterId: string) {
  const applications = await this.applicationModel
    .find()
    .populate({
      path: 'jobId',
      match: {
        recruiterId: new Types.ObjectId(recruiterId),
      },
    })
.populate({
  path: 'userId',
  select: '-password',
})

  return applications.filter(
    (application) => application.jobId !== null,
  );
}
async viewResume(
  id: string,
  userId: string,
  role: string,
  res: Response,
) {
  const application = await this.applicationModel
    .findById(id)
    .populate('jobId')
    .exec();

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  const job = application.jobId as any;

  // Recruiter can view only applications for their own jobs
  if (
    role === 'recruiter' &&
    job.recruiterId.toString() !== userId
  ) {
    throw new UnauthorizedException(
      'You can only view resumes for your own jobs',
    );
  }

  const filePath = path.join(
    process.cwd(),
    'uploads',
    'resumes',
    application.resume,
  );

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
