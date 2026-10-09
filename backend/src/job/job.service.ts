import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Job, JobDocument } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Application, ApplicationDocument } from '../application/schemas/application.schema';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,

    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
  ) {}

  async createJob(createJobDto: CreateJobDto, recruiterId: string) {
    const job = new this.jobModel({
      ...createJobDto,
      recruiterId,
    });

    return job.save();
  }

  async getAllJobs() {
    return this.jobModel
      .find()
      .select('-recruiterId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getRecruiterJobs(recruiterId: string) {
    return this.jobModel
      .find({ recruiterId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getJobById(id: string) {
    this.validateId(id);
    const job = await this.jobModel
      .findById(id)
      .select('-recruiterId')
      .exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async updateJob(
    id: string,
    recruiterId: string,
    updateJobDto: UpdateJobDto,
  ) {
    this.validateId(id);
    const job = await this.jobModel
      .findOneAndUpdate(
        { _id: id, recruiterId },
        { $set: updateJobDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async deleteJob(id: string, recruiterId: string) {
    this.validateId(id);
    const existingJob = await this.jobModel
      .findOne({ _id: id, recruiterId })
      .select('_id')
      .exec();
    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    const applicationCount = await this.applicationModel
      .countDocuments({ jobId: id })
      .exec();
    if (applicationCount > 0) {
      throw new ConflictException(
        'This job has applications and cannot be deleted',
      );
    }

    const job = await this.jobModel
      .findOneAndDelete({ _id: id, recruiterId })
      .exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  private validateId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job ID');
    }
  }
}
