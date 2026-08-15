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

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
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

  return application.save();
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
async getApplicationResume(id: string) {
  const application = await this.applicationModel
    .findById(id)
    .exec();

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  return application.resume;
}
}
