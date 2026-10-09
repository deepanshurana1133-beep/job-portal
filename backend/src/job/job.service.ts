import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Job, JobDocument } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
  ) {}

  async createJob(createJobDto: CreateJobDto, recruiterId: string) {
    const job = new this.jobModel({
      ...createJobDto,
      recruiterId,
    });

    return job.save();
  }
  async getAllJobs() {
    return this.jobModel.find().sort({ createdAt: -1 });
  }
  async getRecruiterJobs(recruiterId: string) {
    return this.jobModel.find({ recruiterId }).sort({ createdAt: -1 }).exec();
  }
  async getJobById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Job not found');
    }
    return this.jobModel.findById(id);
  }
  async updateJob(id: string, updateJobDto: UpdateJobDto, recruiterId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Job not found');
    }
    const job = await this.jobModel.findOneAndUpdate(
      { _id: id, recruiterId },
      { $set: updateJobDto },
      { new: true, runValidators: true },
    );
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }
  async deleteJob(id: string, recruiterId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Job not found');
    }
    const job = await this.jobModel.findOneAndDelete({
      _id: id,
      recruiterId,
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }
}
